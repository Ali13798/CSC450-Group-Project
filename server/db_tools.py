import sqlite3


class db_tools:

    def create_table(cur: sqlite3.Cursor) -> None:
        cur.execute("""CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY,
                user_name   TEXT NOT NULL UNIQUE,
                password    TEXT NOT NULL
            )""")

    def add_user(cur: sqlite3.Cursor, name: str, pswd: str) -> None:
        if not name or not pswd:
            print("Error: Missing name or password.")
            return

        user_exists = db_tools.is_existing_user(cur=cur, name=name)
        if user_exists:
            print("Error: Username already exists. Choose another username.")
            return

        cur.execute(
            "INSERT INTO users (user_name, password) VALUES (?, ?)",
            (name, pswd),
        )

    def get_users_rows(cur: sqlite3.Cursor) -> list[tuple[int, str, str]]:
        return cur.execute("SELECT * FROM users").fetchall()

    def is_existing_user(cur: sqlite3.Cursor, name: str) -> bool:
        rows = db_tools.get_users_rows(cur=cur)
        existing_names = [n[1] for n in rows]

        if name in existing_names:
            return True

        return False

    def get_user_password(cur: sqlite3.Cursor, name: str) -> str:
        return cur.execute("SELECT password FROM users WHERE user_name=?",
                           (name, )).fetchall()

    def create_table_username(cur1: sqlite3.Cursor) -> None:
        cur1.execute("""CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY,
                user_lname   TEXT NOT NULL,
                user_fname   TEXT NOT NULL
            )""")

    def add_userInfo(cur1: sqlite3.Cursor, fname: str, lname: str) -> None:
        if not fname or not lname:
            print("Error: Missing first name or last name.")
            return

        cur1.execute(
            "INSERT INTO users (user_fname, user_lname) VALUES (?, ?)",
            (fname, lname),
        )

    def get_usersName_rows(cur1: sqlite3.Cursor) -> list[tuple[int, str, str]]:
        return cur1.execute("SELECT * FROM users").fetchall()

    def create_table_parent_pin(cur2: sqlite3.Cursor) -> None:
        cur2.execute()
