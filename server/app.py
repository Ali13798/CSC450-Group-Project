import datetime
import hashlib
import sqlite3

import flask
from flask import render_template

from db_tools import db_tools
from flask_session import Session

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
    if flask.session.get("name"):
        return flask.redirect("/")

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

        db_password = db_tools.get_user_password(cur=cur, name=name)
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
    if flask.session.get("name"):
        return flask.redirect("/")

    name = flask.request.form.get("name")
    if " " in name:
        flask.flash('Username cannot contain empty spaces " ". Try again.')
        return flask.redirect(flask.url_for("signup"))

    if not name[0].isalpha():
        flask.flash("Username must begin with an alphabetic character.")
        return flask.redirect(flask.url_for("signup"))

    if not (name.isalnum() or any(x in name for x in ["_", "-", "."])):
        flask.flash("Username cannot contain any special characters.")
        return flask.redirect(flask.url_for("signup"))

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


def get_xp(click_count: int, key_count: int, time_studied: int) -> float:
    xp = (
        (0.0015 * click_count) + (0.00015 * key_count) + (0.25 * time_studied)
    )
    return xp

def get_Title():

    if {{curLevel}} == 0 or {{curLevel}} == 1 or {{curLevel}} == 2 or {{curLevel}} == 3 or {{curLevel}} == 4:
        {{user_title}} = "Novice"
    
    elif {{curLevel}} == 5 or {{curLevel}} == 6 or {{curLevel}} == 7 or {{curLevel}} == 8 or {{curLevel}} == 9:
        {{user_title}} = "Apprentice"

    elif {{curLevel}} == 10 or {{curLevel}} == 11 or {{curLevel}} == 12 or {{curLevel}} == 13 or {{curLevel}} == 14:
        {{user_title}} = "Rising Star"

    elif {{curLevel}} == 15 or {{curLevel}} == 16 or {{curLevel}} == 17 or {{curLevel}} == 18 or {{curLevel}} == 19:
        {{user_title}} = "Master"

    elif {{curLevel}} == 20 or {{curLevel}} == 21 or {{curLevel}} == 22 or {{curLevel}} == 23 or {{curLevel}} == 24:
        {{user_title}} = "Grandmaster"

    elif {{curLevel}} == 25 or {{curLevel}} == 26 or {{curLevel}} == 27 or {{curLevel}} == 28 or {{curLevel}} == 29:
        {{user_title}} = "Chieftain"

    elif {{curLevel}} == 30 or {{curLevel}} == 31 or {{curLevel}} == 32 or {{curLevel}} == 33 or {{curLevel}} == 34:
        {{user_title}} = "Cheiftan"

    elif {{curLevel}} == 35 or {{curLevel}} == 36 or {{curLevel}} == 37 or {{curLevel}} == 38 or {{curLevel}} == 39:
        {{user_title}} = "Demigod"

    elif {{curLevel}} == 40 or {{curLevel}} == 41 or {{curLevel}} == 42 or {{curLevel}} == 43 or {{curLevel}} == 44:
        {{user_title}} = "Diety"

    elif {{curLevel}} == 45 or {{curLevel}} == 46 or {{curLevel}} == 47 or {{curLevel}} == 48 or {{curLevel}} == 49:
        {{user_title}} = "Titan"

    elif {{curLevel}} == 50:
        {{user_title}} = "God-King"

    return {{user_title}}


@app.route("/stats")
def stats():
    username = flask.session.get("name")

    if not username:
        return flask.redirect("/")

    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        user_stats = db_tools.get_stats(cur=cur, username=username)

    stats: list[dict[str, int]] = []
    for stat in user_stats:
        temp_dict = {
            "id": stat[0],
            "date": stat[2],
            "timeStudied": stat[3],
            "clickCount": stat[4],
            "keyCount": stat[5],
        }
        stats.append(temp_dict)

    # Please load in the past 5
    # stats: list[dict[str, int]] = [
    #     {
    #         "id": 1,
    #         "date": "5/1/22",
    #         "clickCount": 5,
    #         "keyCount": 20,
    #         "timeStudied": 125,
    #     },
    #     {
    #         "id": 2,
    #         "date": "5/2/22",
    #         "clickCount": 41,
    #         "keyCount": 12,
    #         "timeStudied": 60,
    #     },
    #     {
    #         "id": 3,
    #         "date": "5/3/22",
    #         "clickCount": 100,
    #         "keyCount": 80,
    #         "timeStudied": 310,
    #     },
    # ]

    return render_template("stats.html", title="Stats", stats=stats)


@app.route("/history")
def history():
    # if you can send all of them, I can have the user provide a date
    # range so they have the ability to see all of their history as our teacher asked
    username = flask.session.get("name")
    if not username:
        return flask.redirect("/")

    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        user_stats = db_tools.get_stats(cur=cur, username=username)

    userHist: list[dict[str, int]] = []
    for stat in user_stats:
        temp_dict = {
            "id": stat[0],
            "date": stat[2],
            "timeStudied": stat[3],
            "clickCount": stat[4],
            "keyCount": stat[5],
        }
        userHist.append(temp_dict)

    # userHist: list[dict[str, int]] = [
    #     {
    #         "id": 1,
    #         "date": "5/1/22",
    #         "clickCount": 5,
    #         "keyCount": 20,
    #         "timeStudied": 125,
    #     },
    #     {
    #         "id": 2,
    #         "date": "5/2/22",
    #         "clickCount": 41,
    #         "keyCount": 12,
    #         "timeStudied": 60,
    #     },
    #     {
    #         "id": 3,
    #         "date": "5/3/22",
    #         "clickCount": 100,
    #         "keyCount": 80,
    #         "timeStudied": 310,
    #     },
    # ]

    return render_template("history.html", title="History", userHist=userHist)


def hash_password(pswd: str) -> str:
    pswd = pswd.encode("utf-8")
    return hashlib.sha256(pswd).hexdigest()


# This is where the extension sends data to for each session
@app.route("/saveStudyData", methods=["POST"])
def saveStudyData():
    username = flask.session.get("name")

    request_data = flask.request.get_json()

    if request_data:
        if "timeStudied" in request_data:
            timeStudied = float(request_data["timeStudied"])
        if "clickCount" in request_data:
            clickCount = int(request_data["clickCount"])
        if "keyCount" in request_data:
            keyCount = int(request_data["keyCount"])

    date_time = datetime.datetime.now().isoformat()
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        db_tools.add_stats(
            cur=cur,
            username=username,
            date_time=date_time,
            duration=timeStudied,
            click_count=clickCount,
            keyboard_count=keyCount,
        )

    return (
        '{ "message":"recieved '
        + str(timeStudied)
        + " "
        + str(clickCount)
        + " "
        + str(keyCount)
        + '" }'
    )




# Anh testing endpoint for saving users name
@app.route("/addUser", methods=["POST"])
def addUser():
    request_info = flask.request.get_json()

    if request_info:
        if "fusername" in request_info:
            fusername = request_info["fusername"]
        if "lusername" in request_info:
            lusername = request_info["lusername"]
    return '{ "message":"recived "' + fusername + " " + lusername + "}"


def main():
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        db_tools.create_tables(cur)
        # cur.execute("DROP TABLE users")

    app.run(debug=True)


if __name__ == "__main__":
    main()
