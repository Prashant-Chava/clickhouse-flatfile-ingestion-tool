import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from clickhouse_connect import get_client
from typing import List
from clickhouse_client import connect_clickhouse, list_tables, fetch_data_from_clickhouse
from fastapi.responses import StreamingResponse
from flatfile_handler import read_csv
import io

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins or specify domains like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def root():
    return {"message": "Backend is up!"}

# Request body model for ClickHouse connection
class ClickHouseRequest(BaseModel):
    host: str
    port: int
    username: str
    jwt_token: str
    secure: bool = True

# POST route for connecting to ClickHouse
@app.post("/connect/clickhouse")
def connect_clickhouse_api(req: ClickHouseRequest):
    client = connect_clickhouse(
        host=req.host,
        port=req.port,
        username=req.username,
        jwt_token=req.jwt_token,
        secure=req.secure
    )
    tables = list_tables(client)
    return {"tables": tables}

# POST route for connecting to FlatFile (reading CSV)
@app.post("/connect/flatfile")
async def connect_flatfile(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = read_csv(io.BytesIO(contents))
        return {"columns": df.columns.tolist(), "preview": df.head().to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# model for ClickHouse to Flat File export
class ClickhouseExportRequest(BaseModel):
    host: str
    port: int
    username: str
    jwt_token: str
    table: str
    columns: List[str]
    secure: bool = True

# route that now accepts JSON body (instead of query params)
@app.post("/ingest/clickhouse-to-file")
async def ingest_clickhouse_to_file(req: ClickhouseExportRequest):
    try:
        print("Connecting to ClickHouse...")

        client = get_client(
            host=req.host,
            port=req.port,
            username=req.username,
            password=req.jwt_token,
            secure=req.secure
        )

        print("Connected. Querying table...")

        query = f"SELECT {', '.join(req.columns)} FROM {req.table} LIMIT 10"
        data = client.query(query).result_rows

        print("Data received. Preparing CSV...")

        df = pd.DataFrame(data, columns=req.columns)
        csv_file = io.StringIO()
        df.to_csv(csv_file, index=False)
        csv_file.seek(0)

        print("Returning file...")
        return StreamingResponse(csv_file, media_type="text/csv", headers={
            "Content-Disposition": f"attachment; filename={req.table}_export.csv"
        })

    except Exception as e:
        print(" Error:", str(e))
        raise HTTPException(status_code=500, detail=f"ClickHouse query failed: {str(e)}")

# POST route for Flat File to ClickHouse ingestion
@app.post("/ingest/file-to-clickhouse")
async def ingest_file_to_clickhouse(
    host: str,
    port: int,
    username: str,
    jwt_token: str,
    table: str,
    file: UploadFile = File(...),
    secure: bool = True
):
    try:
        contents = await file.read()
        df = read_csv(io.BytesIO(contents))
        client = connect_clickhouse(host, port, username, jwt_token, secure)
        
        for index, row in df.iterrows():
            # Prepare the list of values with proper quoting for strings
            values = []
            for val in row.values:
                if isinstance(val, str):  # If the value is a string
                    values.append(f"'{val}'")  # Wrap it in single quotes
                else:
                    values.append(str(val))  # For non-string values, just convert to string
            
            query = f"INSERT INTO {table} ({', '.join(df.columns)}) VALUES ({', '.join(values)})"
            client.command(query)
        
        return {"message": "File successfully ingested into ClickHouse.", "row_count": len(df)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/preview/clickhouse")
async def preview_clickhouse_data(req: ClickhouseExportRequest):
    try:
        client = get_client(
            host=req.host,
            port=req.port,
            username=req.username,
            password=req.jwt_token,
            secure=req.secure
        )

        query = f"SELECT {', '.join(req.columns)} FROM {req.table} LIMIT 100"
        data = client.query(query).result_rows

        return {"columns": req.columns, "rows": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")
