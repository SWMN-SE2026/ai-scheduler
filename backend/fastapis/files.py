import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

# 1. Bring in your MedEntry AI engine!
from llavaAI.ai_service import extract_from_image

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 2. Save the physical image so the UI can display it
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 3. Read the image bytes into memory for Ollama
    file.file.seek(0)
    image_bytes = file.file.read()

    # 4. Run the AI Extraction
    try:
        extracted_data = await extract_from_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing failed: {str(e)}")

    # 5. BULLETPROOFING: Create the database table on the fly if it doesn't exist
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS equipment_logs (
            id SERIAL PRIMARY KEY,
            equipment_name TEXT,
            signed_out_by TEXT,
            location TEXT,
            filename TEXT
        )
    """))
    db.commit()

    # 6. Parse the AI output and save it to the database
    entries = extracted_data.get("entries", [])
    inserted_rows = []

    for entry in entries:
        eq_name = entry.get("equipment_name") or "UNKNOWN"
        user = entry.get("signed_out_by") or "UNKNOWN"
        loc = entry.get("location") or "UNKNOWN"
        
        if eq_name == "UNKNOWN" and user == "UNKNOWN" and loc == "UNKNOWN":
            continue

        db.execute(
            text("""
                INSERT INTO equipment_logs (equipment_name, signed_out_by, location, filename)
                VALUES (:eq_name, :user, :loc, :fname)
            """),
            {"eq_name": eq_name, "user": user, "loc": loc, "fname": file.filename}
        )
        
        inserted_rows.append({
            "equipment_name": eq_name,
            "signed_out_by": user,
            "location": loc,
            "filename": file.filename
        })

    db.commit()

    # 7. Return the massive payload to your frontend
    return {
        "filename": file.filename,
        "saved": True,
        "inserted_count": len(inserted_rows),
        "inserted_rows": inserted_rows,
        "model_output": extracted_data
    }

@router.get("/files")
def get_files(db: Session = Depends(get_db)):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS equipment_logs (
            id SERIAL PRIMARY KEY,
            equipment_name TEXT,
            signed_out_by TEXT,
            location TEXT,
            filename TEXT
        )
    """))
    db.commit()

    result = db.execute(text("SELECT id, equipment_name, signed_out_by, location, filename FROM equipment_logs"))
    files = [{"id": r[0], "equipment_name": r[1], "signed_out_by": r[2], "location": r[3], "filename": r[4]} for r in result]
    return files

@router.get("/equipment-logs")
def get_equipment_logs(db: Session = Depends(get_db)):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS equipment_logs (
            id SERIAL PRIMARY KEY,
            equipment_name TEXT,
            signed_out_by TEXT,
            location TEXT,
            filename TEXT
        )
    """))
    db.commit()

    result = db.execute(text("SELECT id, equipment_name, signed_out_by, location, filename FROM equipment_logs ORDER BY id DESC"))
    logs = [{"id": r[0], "equipment_name": r[1], "signed_out_by": r[2], "location": r[3], "filename": r[4]} for r in result]
    return logs

# NEW: Route to safely wipe the database clean
@router.delete("/equipment-logs")
def clear_equipment_logs(db: Session = Depends(get_db)):
    # Create the table if it doesn't exist so deleting it doesn't cause a crash
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS equipment_logs (
            id SERIAL PRIMARY KEY,
            equipment_name TEXT,
            signed_out_by TEXT,
            location TEXT,
            filename TEXT
        )
    """))
    db.commit()
    
    # Wipe the data
    db.execute(text("DELETE FROM equipment_logs"))
    db.commit()
    return {"message": "All data cleared successfully."}