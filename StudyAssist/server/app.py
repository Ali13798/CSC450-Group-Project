import sqlite3

from flask import Flask, render_template, request

from db_tools import db_tools

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("login.html", title="Index")


@app.route("/home")
def home():
    return render_template("home.html", title="Homepage")


@app.route("/greet", methods=["GET", "POST"])
def greet():
    name = request.form.get("name")
    password = request.form.get("password")
    all_names: list[tuple[int, str, str]] = []

    with sqlite3.connect("./StudyAssist/server/users.db") as con:
        cur = con.cursor()

        db_tools.create_table(cur)

        # Stores password as plain text temporarily. UNSECURE.
        # TODO: hash password.
        db_tools.add_user(cur=cur, name=name, pswd=password)
        all_names = db_tools.get_users_rows(cur)

    if not name:
        name = "world"
    return render_template("greet.html", name=name, names=all_names)


def main():
    app.run(debug=True)


if __name__ == "__main__":
    main()
