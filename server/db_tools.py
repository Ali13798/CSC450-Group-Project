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
                session_duration    DOUBLE(6, 2),
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

        cur.execute(
            "INSERT INTO levels (xp, level) VALUES (?, ?)",
            (0, 1),
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
        ).fetchall()[0]

    def add_stats(
        cur: sqlite3.Cursor,
        username: str,
        date_time: str,
        duration: float,
        click_count: int,
        keyboard_count: int,
    ) -> None:
        user_id = db_tools.get_user_id(cur=cur, username=username)
        cur.execute(
            """INSERT INTO user_sessions (
                user_id,
                session_time,
                session_duration,
                click_count,
                keyboard_count
            ) VALUES (?, ?, ?, ?, ?)""",
            (user_id, date_time, duration, click_count, keyboard_count),
        )

    def get_user_id(cur: sqlite3.Cursor, username: str) -> int:
        return int(
            cur.execute(
                "SELECT id FROM user_credentials WHERE user_name=?",
                (username,),
            ).fetchall()[0][0]
        )

    def get_stats(cur: sqlite3.Cursor, username: str) -> list:
        user_id = db_tools.get_user_id(cur=cur, username=username)
        return cur.execute(
            "SELECT * FROM user_sessions WHERE user_id=?", (user_id,)
        ).fetchall()
