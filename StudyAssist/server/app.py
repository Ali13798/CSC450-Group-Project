import hashlib
import sqlite3

from flask import Flask, flash, redirect, render_template, request, url_for

from db_tools import db_tools

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route("/")
def index():
    return render_template("index.html", title="Index")


@app.route("/home")
def home():
    return render_template("home.html", title="Homepage")


@app.route("/signup")
def signup():
    return render_template("signup.html", title="Sign Up")


@app.route("/login")
def login():
    return render_template("login.html", title="Log In")


@app.route("/greet", methods=["GET", "POST"])
def greet():
    name = request.form.get("name")
    password = request.form.get("password")
    password = hash_password(password)
    all_names: list[tuple[int, str, str]] = []

    with sqlite3.connect("./StudyAssist/server/users.db") as con:
        cur = con.cursor()
        all_names = db_tools.get_users_rows(cur)

        is_existing_user = db_tools.is_existing_user(cur=cur, name=name)
        if is_existing_user:
            db_password = db_tools.get_user_password(cur=cur, name=name)[0]
            if password in db_password:
                if name == "admin":
                    return render_template(
                        "greet.html", name=name, names=all_names
                    )
                else:
                    return render_template("greet.html", name=name)
            else:
                flash("Incorrect Password. Try again.")
                return redirect(url_for("login"))

        else:
            flash("Username not found. Sign up for a new account.")
            return redirect(url_for("signup"))


@app.route("/greetNewUser", methods=["GET", "POST"])
def new_user():
    name = request.form.get("name")
    password = request.form.get("password")
    password = hash_password(password)

    with sqlite3.connect("./StudyAssist/server/users.db") as con:
        cur = con.cursor()
        is_existing_user = db_tools.is_existing_user(cur=cur, name=name)
        if is_existing_user:
            flash("Account already exists. Log in instead.")
            return redirect(url_for("login"))

        db_tools.add_user(cur=cur, name=name, pswd=password)

    return render_template("greet.html", name=name)


def hash_password(pswd: str) -> str:
    pswd = pswd.encode("utf-8")
    return hashlib.sha256(pswd).hexdigest()


def main():
    with sqlite3.connect("./StudyAssist/server/users.db") as con:
        cur = con.cursor()
        db_tools.create_table(cur)
        # cur.execute("DROP TABLE users")

    app.run(debug=True)


if __name__ == "__main__":
    main()
