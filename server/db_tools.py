import sqlite3


class db_tools:
    def create_tables(cur: sqlite3.Cursor) -> None:
        cur.execute(
            """CREATE TABLE IF NOT EXISTS user_credentials (
                id          INTEGER PRIMARY KEY,
                user_name   TEXT NOT NULL UNIQUE,
                password    TEXT NOT NULL
            )"""
        )

        cur.execute(
            """CREATE TABLE IF NOT EXISTS user_details (
                id          INTEGER PRIMARY KEY,
                first_name  TEXT NOT NULL,
                last_name   TEXT NOT NULL
            )"""
        )

        cur.execute(
            """CREATE TABLE IF NOT EXISTS user_sessions (
                id                  INTEGER PRIMARY KEY,
                user_id             INTEGER NOT NULL,
                session_time        TEXT NOT NULL,
                session_duration    INTEGER,
                click_count         INTEGER,
                keyboard_count      INTEGER
            )"""
        )

        cur.execute(
            """CREATE TABLE IF NOT EXISTS levels (
                user_id         INTEGER PRIMARY KEY,
                xp              INTEGER,
                level           INTEGER
            )"""
        )

    def add_user(cur: sqlite3.Cursor, name: str, pswd: str) -> None:
        if not name or not pswd:
            print("Error: Missing name or password.")
            return

        user_exists = db_tools.is_existing_user(cur=cur, name=name)
        if user_exists:
            print("Error: Username already exists. Choose another username.")
            return

        cur.execute(
            "INSERT INTO user_credentials (user_name, password) VALUES (?, ?)",
            (name, pswd),
        )

    def get_user_credentials_rows(
        cur: sqlite3.Cursor,
    ):  # -> list[tuple[int, str, str]] 
        return cur.execute("SELECT * FROM user_credentials").fetchall()

    def is_existing_user(cur: sqlite3.Cursor, name: str) -> bool:
        rows = db_tools.get_user_credentials_rows(cur=cur)
        existing_names = [n[1] for n in rows]

        if name in existing_names:
            return True

        return False

    def get_user_password(cur: sqlite3.Cursor, name: str) -> str:
        return cur.execute(
            "SELECT password FROM user_credentials WHERE user_name=?", (name,)
        ).fetchall()

    def add_userInfo(cur1: sqlite3.Cursor, fname: str, lname: str) -> None:
        if not fname or not lname:
            print("Error: Missing first name or last name.")
            return

        cur1.execute(
            "INSERT INTO user_details (first_name, last_name) VALUES (?, ?)",
            (fname, lname),
        )

    def get_usersName_rows(
        cur1: sqlite3.Cursor,
    ):  # -> list[tuple[int, str, str]] 
        return cur1.execute("SELECT * FROM users").fetchall()

    def create_table_parent_pin(cur2: sqlite3.Cursor) -> None:
        cur2.execute()
