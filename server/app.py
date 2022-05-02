import hashlib
import sqlite3

import flask
from flask import render_template, request
from flask_session import Session

from db_tools import db_tools

app = flask.Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
DB_PATH = "./server/database.db"


@app.route("/")
def index():
    if not flask.session.get("name"):
        return flask.redirect("/login")
    name = flask.session.get("name")
    return render_template("home-site.html", title="Homepage", name=name)


# @app.route("/home")
# def home():
#     return render_template("home-site.html", title="Homepage")


@app.route("/signup")
def signup():
    return render_template("signup.html", title="Sign Up")


@app.route("/login")
def login():
    if flask.session.get("name"):
        return flask.redirect("/")
    return render_template("login.html", title="Log In")


@app.route("/greet", methods=["GET", "POST"])
def greet():

    name = flask.request.form.get("name")
    password = flask.request.form.get("password")
    password = hash_password(password)
    all_names: list[tuple[int, str, str]] = []

    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        all_names = db_tools.get_user_credentials_rows(cur)

        is_existing_user = db_tools.is_existing_user(cur=cur, name=name)
        if is_existing_user:
            db_password = db_tools.get_user_password(cur=cur, name=name)[0]
            if password in db_password:
                flask.session["name"] = name
                if name == "admin":
                    return render_template(
                        "greet.html", name=name, names=all_names
                    )
                else:
                    return render_template("home-site.html", name=name)
            else:
                flask.flash("Incorrect Password. Try again.")
                return flask.redirect(flask.url_for("login"))

        else:
            flask.flash("Username not found. Sign up for a new account.")
            return flask.redirect(flask.url_for("signup"))


@app.route("/greetNewUser", methods=["GET", "POST"])
def new_user():
    name = flask.request.form.get("name")
    password = flask.request.form.get("password")
    password = hash_password(password)

    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        is_existing_user = db_tools.is_existing_user(cur=cur, name=name)
        if is_existing_user:
            flask.flash("Account already exists. Log in instead.")
            return flask.redirect(flask.url_for("login"))

        db_tools.add_user(cur=cur, name=name, pswd=password)

    return render_template("home-site.html", name=name)


@app.route("/logout")
def logout():
    flask.session["name"] = None
    return flask.redirect("/")


@app.route("/stats")
def stats():
    return render_template("stats.html", title="Stats")


def hash_password(pswd: str) -> str:
    pswd = pswd.encode("utf-8")
    return hashlib.sha256(pswd).hexdigest()


# Mackensie testing endpoint for saving data from extension
@app.route("/saveStudyData", methods=["POST"])
def saveStudyData():
    request_data = request.get_json()

    time = "_"
    if request_data:
        if "timeStudied" in request_data:
            time = request_data["timeStudied"]

    return '{ "message":"recieved ' + time + '" }'


def main():
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        db_tools.create_tables(cur)
        # cur.execute("DROP TABLE users")

    app.run(debug=True)


if __name__ == "__main__":
    main()
