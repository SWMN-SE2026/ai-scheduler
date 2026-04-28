# AI-Powered Medical Asset Tracker

> **Status:** Active Development (MVP Phase)
> **Goal:** Eliminate medical equipment "shadow systems" by digitizing handwritten sign-out logs using local Vision AI.

## 📖 Overview
This project is an intelligent logistics assistant that helps hospitals and medical facilities track high-value mobile equipment (such as C-arm X-rays and ventilators). Instead of forcing staff to manually type data into a complex system, this app allows users to simply snap a photo of their physical sign-out sheets. The image is parsed by a local multimodal LLM (Ollama) into structured data, instantly updating a real-time hospital equipment dashboard.


### 📚 Documentation
For detailed engineering documents, please see the `/docs` folder:
* [Project Proposal](docs/proposal.md)
* [Requirements Specification](docs/requirements.md)
* [System Architecture](docs/architecture.md)

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React) | Responsive mobile web interface for camera capture and dashboard viewing. |
| **Backend** | FastAPI (Python) | High-performance API handling image buffers & AI orchestration. |
| **AI Engine** | Ollama | Local Vision LLM (e.g., LLaVA) for privacy-focused handwriting extraction (OCR). |
| **Database** | PostgreSQL | Relational storage for equipment status, locations, and checkout history. |

---

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites
* **Python 3.10+**
* **Node.js 18+**
* **Ollama** (Running locally)

### 1. Backend Setup (FastAPI + AI)

1.  **Navigate to the backend:**
    ```bash
    cd backend
    ```

2.  **Create and activate Virtual Environment:**
    ```bash
    # Windows
    (python or py) -m venv venv
    .\venv\Scripts\Activate

    # Mac/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Prepare the AI Vision Model:**
    Make sure Ollama is installed, then pull a vision-capable model (like LLaVA) instead of a standard text model:
    ```bash
    ollama pull llava
    ```

5.  **Run the Server:**
    ```bash
    uvicorn main:app --reload
    ```
    *The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000)*


## ⚡ API Documentation

Once the backend is running, you can access the interactive Swagger UI to test the endpoints:
**URL:** `http://127.0.0.1:8000/docs`

### Key Endpoints
* `GET /` - Health check.
* `POST /upload-log` - **AI Feature.** Accepts an image upload (`multipart/form-data`) of a handwritten sign-out sheet, processes it via Ollama's vision model, and returns structured JSON.

**Expected JSON Response (from Ollama parsing):**
```json
{
  "equipment_id": "C-Arm",
  "user": "Dr. Smith",
  "location": "OR-3",
  "time_out": "08:00"
}





