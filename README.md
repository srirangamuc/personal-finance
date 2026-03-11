
# Personal Finance

Personal Finance is a modern web application to help you track, analyze, and manage your income and expenses. It features PDF/receipt parsing, beautiful charts, and a user-friendly dashboard for all your financial activities.

## Features

- **Dashboard Overview**: Visualize your income, expenses, and net balance with interactive charts.
- **Smart Receipt Parsing**: Upload receipts or PDFs and automatically extract transaction data using AI.
- **Manual & Bulk Entry**: Add transactions manually or in bulk from extracted documents.
- **Edit & Delete**: Update or remove transactions with instant UI updates.
- **Category Insights**: See spending by category and trends over time.
- **Authentication**: Secure login and user management.
- **Responsive UI**: Works great on desktop and mobile.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Framer Motion
- **Backend**: FastAPI (Python), SQLAlchemy, Alembic
- **Database**: PostgreSQL (or SQLite for dev)
- **AI Parsing**: Groq API (or OpenAI-compatible LLM)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+
- PostgreSQL (or SQLite for local dev)

### Backend Setup

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Set up your database (update `DATABASE_URL` in `.env` if needed).
5. Run migrations:
   ```sh
   alembic upgrade head
   ```
6. Start the FastAPI server:
   ```sh
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

The frontend will be available at [http://localhost:5173](http://localhost:5173) and the backend at [http://localhost:8000](http://localhost:8000).

## Usage

1. Register or log in to your account.
2. Add transactions manually or upload receipts/PDFs for automatic extraction.
3. Review, edit, or delete transactions as needed.
4. Explore charts and summaries to understand your financial habits.

## Folder Structure

- `backend/` — FastAPI app, models, services, and database migrations
- `frontend/` — React app, components, pages, and assets


