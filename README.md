# Bidirectional ClickHouse & Flat File Ingestion Tool

## 📌 Overview

This project is a full-stack web application that enables seamless data ingestion between a ClickHouse database and local CSV (Flat File) sources. It allows:

-  Bidirectional ingestion: ClickHouse ➝ CSV and CSV ➝ ClickHouse
-  JWT Token-based authentication for ClickHouse
-  Column selection and data preview before ingestion/export
-  Export ClickHouse tables as CSV
-  Upload and insert CSV data into ClickHouse tables

---

##  Tech Stack

- **Backend**: Python (FastAPI)
- **Frontend**: React.js (with Axios)
- **Database**: ClickHouse (Docker)
- **Styling**: Custom CSS
- **Authentication**: JWT/Password for ClickHouse

---

---

##  Setup Instructions

###  Backend Setup

1. Navigate to backend:
   ```bash
   cd backend

2. Create and activate virtual environment:
 ``bash
 python -m venv venv
.\venv\Scripts\activate

3. Install dependencies:
pip install fastapi uvicorn clickhouse-connect python-multipart pandas

4. Run the FastAPI backend:
  uvicorn main:app --reload
    Your backend will be running at: http://127.0.0.1:8000

 ###  Frontend Setup  

 1. Navigate to the frontend folder:
   cd frontend

2. Install dependencies:
  npm install

3. Start the React development server:
  npm start

  This will open the frontend at: http://localhost:3000

 ### Set Up ClickHouse Using Docker
 If you don't have ClickHouse set up, run this command to start it using Docker:

 docker run -d --name clickhouse \
  -p 9000:9000 -p 8123:8123 \
  -e CLICKHOUSE_PASSWORD=YourPassword \
  clickhouse/clickhouse-server

  Access ClickHouse web UI: http://localhost:8123

Login using:

Username: default

Password: YourPassword

To connect from the app:

Host: localhost

Port: 8123

Username: default

JWT/Password: YourPassword









