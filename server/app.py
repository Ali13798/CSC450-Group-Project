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
LEVEL_UP_XP_REQ = 1000


@app.route("/")
def index():
    if not flask.session.get("name"):
        return flask.redirect("/login")

    name = flask.session.get("name")
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        # cur_xp, cur_level = db_tools.get_user_xp_level(cur=cur, username=name)
        user_stats = db_tools.get_stats(cur=cur, username=name)

        calc_xp = 0
        for stat in user_stats:
            calc_xp += get_xp(
                time_studied=stat[3],
                click_count=stat[4],
                key_count=stat[5],
            )

        level = int(calc_xp // LEVEL_UP_XP_REQ)
        if level == 0:
            level = 1
        xp = int(calc_xp % LEVEL_UP_XP_REQ)

        title = get_Title(cur_level=level)
        next_title = get_Title(cur_level=level + 5)

        db_tools.set_user_xp_level(cur=cur, username=name, xp=xp, level=level)

    return render_template(
        "home-site.html",
        title="Homepage",
        name=name,
        xp=xp,
        curLevel=level,
        user_title=title,
        next_title=next_title,
    )


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
            return flask.redirect("/signup")

        db_password = db_tools.get_user_password(cur=cur, name=name)
        if password not in db_password:
            flask.flash("Incorrect Password. Try again.")
            return flask.redirect("/login")

        flask.session["name"] = name
        if name == "admin":
            return render_template("greet.html", name=name, names=all_names)
        else:
            return flask.redirect("/")


@app.route("/greetNewUser", methods=["GET", "POST"])
def new_user():
    if flask.session.get("name"):
        return flask.redirect("/")

    name = flask.request.form.get("name")
    if " " in name:
        flask.flash('Username cannot contain empty spaces " ". Try again.')
        return flask.redirect("/signup")

    if not name[0].isalpha():
        flask.flash("Username must begin with an alphabetic character.")
        return flask.redirect("/signup")

    if not (name.isalnum() or any(x in name for x in ["_", "-", "."])):
        flask.flash("Username cannot contain any special characters.")
        return flask.redirect("/signup")

    password = flask.request.form.get("password")

    confirm_password = flask.request.form.get("confirm_password")
    if password != confirm_password:
        flask.flash("Passwords do not match, try again.")
        return flask.redirect("/signup")

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


def get_xp(click_count: int, key_count: int, time_studied: int) -> int:
    xp = (2 * click_count) + (3 * key_count) + (time_studied)
    return xp


@app.route("/addReward", methods=["POST"])
def add_reward():
    username = flask.session.get("name")
    reward_level = flask.request.form["reward_level"]
    reward = flask.request.form["reward_text"]
    print(username, reward_level, reward)
    with sqlite3.connect(DB_PATH) as con:
        cur = con.cursor()
        db_tools.add_reward(
            cur=cur,
            username=username,
            reward_level=reward_level,
            reward=reward,
        )

    return flask.redirect(flask.url_for("index"))


def get_Title(cur_level: int) -> str:
    new_levels = {
        4: "Novice",
        9: "Apprentice",
        14: "Rising Star",
        19: "Master",
        24: "Grandmaster",
        29: "Chieftain",
        34: "Demigod",
        39: "Deity",
        44: "Titan",
        49: "God-King",
    }

    n = 0

    if cur_level in new_levels.keys():
        n = cur_level

    else:
        # loop through keys
        keyList = list(new_levels.keys())

        if cur_level < keyList[0]:
            n = keyList[0]
        else:

            k = 0
            for k in range(0, len(keyList)):

                if k == len(keyList) - 1:  # if at the end of the list
                    if n == 0:  # is unset still
                        n = keyList[len(keyList) - 1]
                    pass

                else:
                    if cur_level > keyList[k] and cur_level < keyList[k + 1]:

                        n = keyList[k]

    return new_levels[n]


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

    return render_template("stats.html", title="Stats", stats=stats)


@app.route("/history")
def history():
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
        # cur.execute("DROP TABLE levels")
        # cur.execute(
        #     """INSERT INTO levels (
        #         user_id,
        #         xp,
        #         level
        #     ) VALUES (?, ?, ?)""",
        #     (10, 0, 1),
        # )
        # print(db_tools.get_user_xp_level(cur=cur, username="userforlvl"))

    app.run(debug=True)


if __name__ == "__main__":
    main()
