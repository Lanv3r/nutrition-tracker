# Eatr - Nutrition Tracker

Eatr is a full-stack nutrition tracker for logging meals, calculating macros, and visualizing intake trends with charts. It includes a passwordless demo mode with seeded recent data so the UI is immediately explorable.

## Features

- Meal logging with serving size and nutrition facts
- Daily and 7/30 day macro composition charts
- Calorie goal tracking
- Editable and deletable meal entries
- Passwordless demo mode with seeded recent meals

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui, Recharts
- Backend: Flask, SQLite
- Auth: httpOnly session cookies with CSRF protection

## Project Structure

- `frontend/` - React app
- `backend/` - Flask API + SQLite
- `backend/init_db.py` - one-time DB initializer

## Getting Started

### 1) Install dependencies

Frontend:

```
cd frontend
npm install
```

Backend (create a venv first if you prefer):

```
cd backend
pip install -r requirements.txt
```

### 2) Initialize databases

```
python backend/init_db.py
```

### 3) Run the servers

Backend:

```
cd backend
python app.py
```

Frontend:

```
cd frontend
npm run dev
```

Open the app at `http://localhost:5173`.

## Demo Mode

The login screen includes a "Try the demo" button. It creates/refreshes a demo account, seeds meals with dates inside the last 30 days, and logs you in automatically.

## Notes on Auth / CSRF

- The backend uses session cookies. All authenticated requests must use `credentials: "include"`.
- Mutating requests (POST/PATCH/DELETE) require `X-CSRFToken` header from `/api/csrf-token`.
- For local dev over HTTP, `SESSION_COOKIE_SECURE` should be `False`. Use `True` in production over HTTPS.

## Scripts

Frontend:

- `npm run dev` - dev server
- `npm run build` - production build
- `npm run lint` - lint

## Future Improvements

- Replace prompt/confirm UI with modal dialogs
- Add tests and CI
- Improve data validation and error handling
- Persist user settings (units, goals)

## License

MIT
