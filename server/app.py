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
        if not is_existing_user:
            flask.flash("Username not found. Sign up for a new account.")
            return flask.redirect(flask.url_for("signup"))

        db_password = db_tools.get_user_password(cur=cur, name=name)[0]
        if password not in db_password:
            flask.flash("Incorrect Password. Try again.")
            return flask.redirect(flask.url_for("login"))

        flask.session["name"] = name
        if name == "admin":
            return render_template("greet.html", name=name, names=all_names)
        else:
            return flask.redirect(flask.url_for("index"))


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

    flask.session["name"] = name
    return flask.redirect(flask.url_for("index"))


@app.route("/logout")
def logout():
    flask.session["name"] = None
    return flask.redirect("/")


# Ali's example, keeping for reference
@app.route("/stats2")
def stats2():

    stats: list[dict[str, int]] = [
        {
            "id": 1,
            "clickCount": 5,
            "KeyCount": 20,
            "timeStudied": 125,
        },
        {
            "id": 2,
            "clickCount": 41,
            "KeyCount": 12,
            "timeStudied": 310,
        },
    ]

    return render_template("stats2.html", title="Stats", stats=stats)


@app.route("/stats")
def stats():
    # Returns the totals for clickcount, keycount, and timestudied

    stats: dict[str, int] = {
        "clickCountTot": 5,
        "KeyCountTot": 20,
        "timeStudiedTot": 125,
    }

    # Returns records of the past 5 or 10 session counts for the graphs

    # Mouse History
    mouseHst: list[dict[str, int]] = [
        {
            "id": 1,
            "date": "5/2/22",
            "clickCount": 5
        },
        {
            "id": 2,
            "date": "5/3/22",
            "clickCount": 41
        },
    ]

    # Key History
    keyHst: list[dict[str, int]] = [
        {
            "id": 1,
            "date": "5/2/22",
            "keyCount": 20
        },
        {
            "id": 2,
            "date": "5/3/22",
            "keyCount": 12
        },
    ]

    # Minutes History
    minHst: list[dict[str, int]] = [
        {
            "id": 1,
            "date": "5/2/22",
            "timeStudied": 125
        },
        {
            "id": 2,
            "date": "5/3/22",
            "timeStudied": 310
        },
    ]

    return render_template("stats.html",
                           title="Stats",
                           stats=stats,
                           mouseHst=mouseHst,
                           keyHst=keyHst,
                           minHst=minHst)


@app.route("/history")
def history():
    return render_template("history.html", title="History")


def hash_password(pswd: str) -> str:
    pswd = pswd.encode("utf-8")
    return hashlib.sha256(pswd).hexdigest()


# Mackensie testing endpoint for saving data from extension
@app.route("/saveStudyData", methods=["POST"])
def saveStudyData():
    request_data = request.get_json()

    if request_data:
        if "timeStudied" in request_data:
            timeStudied = request_data["timeStudied"]
        if "clickCount" in request_data:
            clickCount = request_data["clickCount"]
        if "keyCount" in request_data:
            keyCount = request_data["keyCount"]

    return ('{ "message":"recieved ' + timeStudied + " " + str(clickCount) +
            " " + str(keyCount) + '" }')


#Anh testing endpoint for saving users name
@app.route("/addUser", methods=["POST"])
def addUser():
    request_info = request.get_json()

    if request_info:
        if "fusername" in request_info:
            fusername = request_info["fusername"]
        if "lusername" in request_info:
            lusername = request_info["lusername"]
    return ('{ "message":"recived "' + fusername + " " + lusername + "}")


def main():
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        db_tools.create_tables(cur)
        # cur.execute("DROP TABLE users")

    app.run(debug=True)


if __name__ == "__main__":
    main()
