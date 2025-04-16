import pandas as pd
from fastapi import HTTPException

def read_csv(file) -> pd.DataFrame:
    try:
        # Read the CSV file into a pandas DataFrame
        df = pd.read_csv(file)
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")
