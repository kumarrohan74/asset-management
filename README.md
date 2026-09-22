# Asset Management System

A simple local asset management system built with **React**, **FastAPI**, **SQLAlchemy**, and **SQLite**.

The application allows organizations to manage employees, company assets, and asset assignments from a single dashboard.

---

## Features

### Dashboard

* Total employees
* Total assets
* Available assets
* Assigned assets
* Recent asset assignments

### Employee Management

* Add employees
* View employees
* Edit employee details
* Delete employees
* Employee status management

### Asset Management

* Add assets
* View assets
* Edit asset details
* Delete assets
* Track asset status
* Filter available assets

### Asset Assignment

* Assign assets to employees
* View active assignments
* Return assigned assets
* Delete assignment records
* Prevent unavailable assets from being assigned

### Local Database

* Uses SQLite
* No external database server required
* Data is stored locally in:

```text
database/asset_management.db
```

---

## Technology Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic

### Database

* SQLite

### Development

* Node.js
* npm
* Python virtual environment (`venv`)

---

## Project Structure

```text
asset-management/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── employees.py
│   │   │   ├── assets.py
│   │   │   └── assignments.py
│   │   │
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── vite.config.js
│
├── database/
│   └── asset_management.db
│
├── start.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

> `backend/venv/`, `frontend/node_modules/`, and the SQLite database are local/generated files and are not required in the Git repository.

---

## Prerequisites

The following must be installed on the computer:

* **Node.js**
* **npm**
* **Python**

Node.js and Python should be installed normally on the computer and do not need to be installed inside this project folder.

---

## Running the Application

### 1. Open Terminal

Navigate to the project folder:

```bash
cd asset-management
```

### 2. Start the application

Run:

```bash
npm run start
```

The startup script automatically:

1. Checks whether Python is installed.
2. Creates the Python virtual environment if it does not exist.
3. Installs backend dependencies from `requirements.txt`.
4. Installs frontend dependencies if `node_modules` does not exist.
5. Starts the FastAPI backend.
6. Starts the React frontend.

---

## Application URLs

Once the application starts:

### Frontend

```text
http://localhost:5173
```

### Backend API

```text
http://127.0.0.1:8000
```

### FastAPI Swagger Documentation

```text
http://127.0.0.1:8000/docs
```

---

## Database

The application uses SQLite.

The database is stored locally at:

```text
database/asset_management.db
```

No PostgreSQL, MySQL, or other database server is required.

The database file is intentionally excluded from Git so each local installation can maintain its own data.

---

## Backend API

The backend exposes REST APIs for:

```text
/employees
/assets
/assignments
```

FastAPI automatically provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

## First-Time Setup

For a new computer:

1. Install Node.js.
2. Install Python.
3. Download or clone this repository.
4. Open a terminal in the project folder.
5. Run:

```bash
npm run start
```

No manual Python virtual environment setup is required.

No manual frontend dependency installation is required.

The startup script handles the setup automatically.

---

## Stopping the Application

Press:

```text
Ctrl + C
```

in the terminal running the application.

This stops both the frontend and backend servers.

---

## Important Notes

* The application is designed to run locally.
* Application data is stored in SQLite.
* Do not delete `database/asset_management.db` if you want to preserve existing local data.
* Do not commit passwords, API keys, tokens, or `.env` files to GitHub.
* `backend/venv/` and `frontend/node_modules/` are generated automatically and should not be committed.

---

## Author

Asset Management System

Built using React + FastAPI + SQLite.
