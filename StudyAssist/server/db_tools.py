import sqlite3


class db_tools:
    def create_table(cur: sqlite3.Cursor) -> None:
        cur.execute(
            """CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY,
                user_name   TEXT NOT NULL UNIQUE,
                password    TEXT NOT NULL
            )"""
        )

    def add_user(cur: sqlite3.Cursor, name: str, pswd: str) -> None:
        if not name or not pswd:
            print("Error: Missing name or password.")
            return

        rows = db_tools.get_users_rows(cur)
        existing_names = [n[1] for n in rows]
        if name in existing_names:
            print("Error: Username already exists. Choose another username.")
            return

        cur.execute(
            "INSERT INTO users (user_name, password) VALUES (?, ?)",
            (name, pswd),
        )

    def get_users_rows(cur: sqlite3.Cursor) -> list[tuple[int, str, str]]:
        result = cur.execute("SELECT * FROM users").fetchall()
        return result
