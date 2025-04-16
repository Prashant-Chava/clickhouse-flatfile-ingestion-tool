from clickhouse_connect import get_client
from fastapi import HTTPException
import pandas as pd

# Function to connect to ClickHouse
def connect_clickhouse(host: str, port: int, username: str, jwt_token: str, secure: bool = True):
    try:
        client = get_client(
            host=host,
            port=port,
            username=username,
            password=jwt_token,
            secure=secure
        )
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ClickHouse connection failed: {str(e)}")

# Function to list tables from ClickHouse
def list_tables(client):
    try:
        return client.query("SHOW TABLES").result_rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list tables: {str(e)}")

# Function to fetch data from a ClickHouse table and convert it into a DataFrame
def fetch_data_from_clickhouse(host: str, port: int, username: str, jwt_token: str, table: str, columns: list, secure: bool = True):
    try:
        # Establish connection to ClickHouse
        client = connect_clickhouse(host, port, username, jwt_token, secure)
        
        # Form the query to fetch required columns from the table
        query = f"SELECT {', '.join(columns)} FROM {table}"
        data = client.query(query).result_rows
        
        # Convert the result data into a pandas DataFrame
        df = pd.DataFrame(data, columns=columns)
        return df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ClickHouse query failed: {str(e)}")
