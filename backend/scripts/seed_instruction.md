Seed data for development
==========================

The backend exposes a helper script that inserts demo records (client, lawyer,
bookings, chats, ratings, …) so the frontend team can exercise every screen
without having to create data manually.

Prerequisites
-------------
1. A running PostgreSQL instance that matches the connection string in your
   backend `.env` file. The seed script uses the same credentials as the FastAPI
   app (`postgresql+asyncpg` DSN).
2. Backend dependencies installed. Either run `uv sync` or `poetry install`
   from the `backend/` folder.
3. Apply the latest migrations (skip if you already have a ready database):
   `uv run alembic upgrade head` *or* `poetry run alembic upgrade head`.

Running the script
------------------
1. `cd backend`
2. Execute the seed script with your preferred runner:
   * `uv run python scripts/seed_data.py`
   * or `poetry run python scripts/seed_data.py`

The script is idempotent. If the demo client and lawyer already exist it will
exit early without modifying data. After the script completes successfully you
can sign in with:

* Client — `demo_client@example.com` / `Demo123!`
* Lawyer — `demo_lawyer@example.com` / `Demo123!`

The admin account is still created automatically on application start-up and
remains untouched by this script.