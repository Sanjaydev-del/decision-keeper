# Decision Keeper

A personal decision tracking application to record, organize, and review important life choices.

## Features

- **User Authentication**: Register and Login securely.
- **Dashboard**: View all your decisions in one place.
- **Create Decision**: Log new decisions with title, description, and category.
- **Delete Decision**: Remove decisions you no longer need.
- **Categories**: Organize by Career, Health, Finance, Personal, or Other.

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Authentication**: JWT (HttpOnly Cookies)

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file (optional, defaults provided for dev):
    ```env
    JWT_SECRET=your_secret_key
    PORT=3000
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## API Endpoints

- `POST /api/register`: Create a new account.
- `POST /api/login`: Log in.
- `POST /api/logout`: Log out.
- `GET /api/me`: Get current user info.
- `GET /api/decisions`: Fetch all decisions.
- `POST /api/decisions`: Create a new decision.
- `DELETE /api/decisions/:id`: Delete a decision.
