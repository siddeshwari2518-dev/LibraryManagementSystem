from flask import Flask, request, jsonify, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection, initialize_database
import os


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

app.secret_key = "libraverse_secret_key_2026"


# ==========================================
# FOLDER PATHS
# ==========================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

FRONTEND_FOLDER = os.path.join(
    BASE_DIR,
    "frontend"
)


# ==========================================
# INITIALIZE DATABASE
# ==========================================

initialize_database()


# ==========================================
# LOGIN PAGE
# ==========================================

@app.route("/")
def login_page():

    return send_from_directory(
        FRONTEND_FOLDER,
        "login.html"
    )


# ==========================================
# REGISTER PAGE
# ==========================================

@app.route("/register")
def register_page():

    return send_from_directory(
        FRONTEND_FOLDER,
        "register.html"
    )


# ==========================================
# DASHBOARD PAGE
# ==========================================

@app.route("/dashboard")
def dashboard_page():

    if "user_id" not in session:

        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )

    return send_from_directory(
        FRONTEND_FOLDER,
        "dashboard.html"
    )
# ==========================================
# DASHBOARD STATISTICS
# ==========================================

@app.route("/api/dashboard-stats", methods=["GET"])
def dashboard_stats():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db_connection()
    cursor = connection.cursor()

    # Total books
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM books
    """)
    total_books = cursor.fetchone()["count"]

    # Available books
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM books
        WHERE status = 'Available'
    """)
    available_books = cursor.fetchone()["count"]

    # Issued books
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM books
        WHERE status = 'Issued'
    """)
    issued_books = cursor.fetchone()["count"]

    # Total members
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM members
    """)
    total_members = cursor.fetchone()["count"]

    # Returned books
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM issued_books
        WHERE status = 'Returned'
    """)
    returned_books = cursor.fetchone()["count"]

    connection.close()

    return jsonify({
        "success": True,
        "total_books": total_books,
        "available_books": available_books,
        "issued_books": issued_books,
        "total_members": total_members,
        "returned_books": returned_books
    })
# ==========================================
# RECENT LIBRARY ACTIVITY
# ==========================================

@app.route("/api/recent-activity", methods=["GET"])
def recent_activity():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            issued_books.id,
            issued_books.issue_date,
            issued_books.return_date,
            issued_books.status,
            books.title AS book_title,
            members.name AS member_name
        FROM issued_books
        JOIN books
            ON issued_books.book_id = books.id
        JOIN members
            ON issued_books.member_id = members.id
        ORDER BY issued_books.id DESC
        LIMIT 8
    """)

    rows = cursor.fetchall()

    connection.close()

    activities = []

    for row in rows:

        activities.append({
            "id": row["id"],
            "book_title": row["book_title"],
            "member_name": row["member_name"],
            "issue_date": row["issue_date"],
            "return_date": row["return_date"],
            "status": row["status"]
        })

    return jsonify({
        "success": True,
        "activities": activities
    })
# ==========================================
# BOOKS PAGE
# ==========================================

@app.route("/books")
def books_page():

    if "user_id" not in session:

        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )

    return send_from_directory(
        FRONTEND_FOLDER,
        "books.html"
    )


# ==========================================
# REGISTER API
# ==========================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    name = data.get(
        "name",
        ""
    ).strip()

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        ""
    )

    if not name or not email or not password:

        return jsonify({
            "success": False,
            "message": "Please fill all fields."
        }), 400

    if len(password) < 6:

        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Email already registered."
        }), 400

    hashed_password = generate_password_hash(
        password
    )

    cursor.execute(
        """
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
        """,
        (
            name,
            email,
            hashed_password
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Registration successful!"
    })


# ==========================================
# LOGIN API
# ==========================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    email = data.get(
        "email",
        ""
    ).strip().lower()

    password = data.get(
        "password",
        ""
    )

    if not email or not password:

        return jsonify({
            "success": False,
            "message": "Please enter email and password."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    user = cursor.fetchone()

    connection.close()

    if not user:

        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    if not check_password_hash(
        user["password"],
        password
    ):

        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    session["user_id"] = user["id"]
    session["user_name"] = user["name"]
    session["user_email"] = user["email"]

    return jsonify({
        "success": True,
        "message": "Login successful!"
    })


# ==========================================
# CURRENT USER API
# ==========================================

@app.route("/api/me")
def current_user():

    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Not logged in."
        }), 401

    return jsonify({
        "success": True,
        "user": {
            "id": session["user_id"],
            "name": session["user_name"],
            "email": session["user_email"]
        }
    })


# ==========================================
# LOGOUT API
# ==========================================

@app.route("/api/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    })


# ==========================================
# GET BOOKS
# ==========================================

@app.route("/api/books", methods=["GET"])
def get_books():

    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    search = request.args.get(
        "search",
        ""
    ).strip()

    connection = get_db_connection()
    cursor = connection.cursor()

    if search:

        cursor.execute(
            """
            SELECT *
            FROM books
            WHERE title LIKE ?
               OR author LIKE ?
               OR isbn LIKE ?
            ORDER BY id DESC
            """,
            (
                f"%{search}%",
                f"%{search}%",
                f"%{search}%"
            )
        )

    else:

        cursor.execute(
            """
            SELECT *
            FROM books
            ORDER BY id DESC
            """
        )

    books = cursor.fetchall()

    connection.close()

    result = []

    for book in books:

        result.append({
            "id": book["id"],
            "title": book["title"],
            "author": book["author"],
            "isbn": book["isbn"],
            "category": book["category"],
            "status": book["status"]
        })

    return jsonify({
        "success": True,
        "books": result
    })


# ==========================================
# ADD BOOK
# ==========================================

@app.route("/api/books", methods=["POST"])
def add_book():

    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid book data."
        }), 400

    title = data.get(
        "title",
        ""
    ).strip()

    author = data.get(
        "author",
        ""
    ).strip()

    isbn = data.get(
        "isbn",
        ""
    ).strip()

    category = data.get(
        "category",
        "Other"
    ).strip()

    if not title or not author or not isbn:

        return jsonify({
            "success": False,
            "message": "Please fill all required fields."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO books
            (title, author, isbn, category, status)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                title,
                author,
                isbn,
                category,
                "Available"
            )
        )

        connection.commit()
        connection.close()

        return jsonify({
            "success": True,
            "message": "Book added successfully!"
        })

    except Exception:

        connection.close()

        return jsonify({
            "success": False,
            "message": "ISBN already exists or invalid book data."
        }), 400


# ==========================================
# DELETE BOOK
# ==========================================

@app.route(
    "/api/books/<int:book_id>",
    methods=["DELETE"]
)
def delete_book(book_id):

    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM books
        WHERE id = ?
        """,
        (book_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Book deleted successfully!"
    })


# ==========================================
# EDIT BOOK
# ==========================================

@app.route(
    "/api/books/<int:book_id>",
    methods=["PUT"]
)
def edit_book(book_id):

    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Invalid request."
        }), 400

    title = data.get(
        "title",
        ""
    ).strip()

    if not title:

        return jsonify({
            "success": False,
            "message": "Book title cannot be empty."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE books
        SET title = ?
        WHERE id = ?
        """,
        (
            title,
            book_id
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Book updated successfully!"
    })
# ==========================================
# MEMBER MANAGEMENT
# ==========================================

@app.route("/members")
def members_page():

    if "user_id" not in session:

        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )

    return send_from_directory(
        FRONTEND_FOLDER,
        "members.html"
    )


# ==========================================
# GET MEMBERS
# ==========================================

@app.route("/api/members", methods=["GET"])
def get_members():

    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401


    search = request.args.get(
        "search",
        ""
    ).strip()


    connection = get_db_connection()
    cursor = connection.cursor()


    if search:

        cursor.execute(
            """
            SELECT *
            FROM members
            WHERE name LIKE ?
               OR email LIKE ?
               OR phone LIKE ?
            ORDER BY id DESC
            """,
            (
                f"%{search}%",
                f"%{search}%",
                f"%{search}%"
            )
        )

    else:

        cursor.execute(
            """
            SELECT *
            FROM members
            ORDER BY id DESC
            """
        )


    members = cursor.fetchall()

    connection.close()


    result = []


    for member in members:

        result.append({

            "id":
                member["id"],

            "name":
                member["name"],

            "email":
                member["email"],

            "phone":
                member["phone"]

        })


    return jsonify({

        "success": True,

        "members":
            result

    })


# ==========================================
# ADD MEMBER
# ==========================================

@app.route(
    "/api/members",
    methods=["POST"]
)
def add_member():

    if "user_id" not in session:

        return jsonify({

            "success": False,

            "message":
                "Please login first."

        }), 401


    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "message":
                "Invalid member data."

        }), 400


    name = data.get(
        "name",
        ""
    ).strip()


    email = data.get(
        "email",
        ""
    ).strip().lower()


    phone = data.get(
        "phone",
        ""
    ).strip()


    if not name or not email or not phone:

        return jsonify({

            "success": False,

            "message":
                "Please fill all fields."

        }), 400


    connection = get_db_connection()
    cursor = connection.cursor()


    try:

        cursor.execute(
            """
            INSERT INTO members
            (name, email, phone)
            VALUES (?, ?, ?)
            """,
            (
                name,
                email,
                phone
            )
        )


        connection.commit()

        connection.close()


        return jsonify({

            "success": True,

            "message":
                "Member added successfully!"

        })


    except Exception:

        connection.close()


        return jsonify({

            "success": False,

            "message":
                "Email already exists."

        }), 400


# ==========================================
# DELETE MEMBER
# ==========================================

@app.route(
    "/api/members/<int:member_id>",
    methods=["DELETE"]
)
def delete_member(member_id):

    if "user_id" not in session:

        return jsonify({

            "success": False,

            "message":
                "Please login first."

        }), 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        DELETE FROM members
        WHERE id = ?
        """,
        (member_id,)
    )


    connection.commit()

    connection.close()


    return jsonify({

        "success": True,

        "message":
            "Member deleted successfully!"

    })


# ==========================================
# EDIT MEMBER
# ==========================================

@app.route(
    "/api/members/<int:member_id>",
    methods=["PUT"]
)
def edit_member(member_id):

    if "user_id" not in session:

        return jsonify({

            "success": False,

            "message":
                "Please login first."

        }), 401


    data = request.get_json()


    name = data.get(
        "name",
        ""
    ).strip()


    if not name:

        return jsonify({

            "success": False,

            "message":
                "Member name cannot be empty."

        }), 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        UPDATE members
        SET name = ?
        WHERE id = ?
        """,
        (
            name,
            member_id
        )
    )


    connection.commit()

    connection.close()


    return jsonify({

        "success": True,

        "message":
            "Member updated successfully!"

    })

# ==========================================
# FRONTEND FILES
# ==========================================

@app.route("/<path:filename>")
def frontend_files(filename):

    return send_from_directory(
        FRONTEND_FOLDER,
        filename
    )

# ==========================================
# ISSUE BOOK MANAGEMENT
# ==========================================

@app.route("/issue")
def issue_page():

    if "user_id" not in session:
        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )

    return send_from_directory(
        FRONTEND_FOLDER,
        "issue.html"
    )


# ==========================================
# GET CURRENTLY ISSUED BOOKS
# ==========================================

@app.route("/api/issued-books", methods=["GET"])
def get_issued_books():

    if "user_id" not in session:

        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute("""
        SELECT
            issued_books.id,
            issued_books.issue_date,
            books.title AS book_title,
            members.name AS member_name,
            members.email AS member_email

        FROM issued_books

        JOIN books
            ON issued_books.book_id = books.id

        JOIN members
            ON issued_books.member_id = members.id

        WHERE issued_books.status = 'Issued'

        ORDER BY issued_books.id DESC
    """)


    rows = cursor.fetchall()

    connection.close()


    issued_books = []


    for row in rows:

        issued_books.append({

            "id":
                row["id"],

            "book_title":
                row["book_title"],

            "member_name":
                row["member_name"],

            "member_email":
                row["member_email"],

            "issue_date":
                row["issue_date"]

        })


    return jsonify({

        "success": True,

        "issued_books":
            issued_books

    })


# ==========================================
# ISSUE BOOK
# ==========================================

@app.route(
    "/api/issue-book",
    methods=["POST"]
)
def issue_book():

    if "user_id" not in session:

        return jsonify({

            "success": False,

            "message":
                "Please login first."

        }), 401


    data = request.get_json()


    book_id = data.get("book_id")

    member_id = data.get("member_id")

    issue_date = data.get("issue_date")


    if not book_id or not member_id or not issue_date:

        return jsonify({

            "success": False,

            "message":
                "Please select book, member and date."

        }), 400


    connection = get_db_connection()
    cursor = connection.cursor()


    # Check book

    cursor.execute(
        """
        SELECT *
        FROM books
        WHERE id = ?
        """,
        (book_id,)
    )


    book = cursor.fetchone()


    if not book:

        connection.close()

        return jsonify({

            "success": False,

            "message":
                "Book not found."

        }), 404


    if book["status"] != "Available":

        connection.close()

        return jsonify({

            "success": False,

            "message":
                "This book is already issued."

        }), 400


    # Check member

    cursor.execute(
        """
        SELECT *
        FROM members
        WHERE id = ?
        """,
        (member_id,)
    )


    member = cursor.fetchone()


    if not member:

        connection.close()

        return jsonify({

            "success": False,

            "message":
                "Member not found."

        }), 404


    # Create issue record

    cursor.execute(
        """
        INSERT INTO issued_books
        (
            book_id,
            member_id,
            issue_date,
            status
        )

        VALUES (?, ?, ?, ?)
        """,
        (
            book_id,
            member_id,
            issue_date,
            "Issued"
        )
    )


    # Change book status

    cursor.execute(
        """
        UPDATE books

        SET status = 'Issued'

        WHERE id = ?
        """,
        (book_id,)
    )


    connection.commit()

    connection.close()


    return jsonify({

        "success": True,

        "message":
            "Book issued successfully!"

    })
# ==========================================
# RETURN BOOK MANAGEMENT
# ==========================================

@app.route("/return")
def return_page():

    if "user_id" not in session:
        return send_from_directory(
            FRONTEND_FOLDER,
            "login.html"
        )

    return send_from_directory(
        FRONTEND_FOLDER,
        "return.html"
    )


@app.route("/api/return-book/<int:issue_id>", methods=["PUT"])
def return_book(issue_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM issued_books
        WHERE id = ?
    """, (issue_id,))

    issued_book = cursor.fetchone()

    if not issued_book:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Issued book record not found."
        }), 404


    if issued_book["status"] != "Issued":
        connection.close()

        return jsonify({
            "success": False,
            "message": "This book has already been returned."
        }), 400


    # Update issued book
    cursor.execute("""
        UPDATE issued_books
        SET
            status = 'Returned',
            return_date = DATE('now')
        WHERE id = ?
    """, (issue_id,))


    # Make book available again
    cursor.execute("""
        UPDATE books
        SET status = 'Available'
        WHERE id = ?
    """, (issued_book["book_id"],))


    connection.commit()
    connection.close()


    return jsonify({
        "success": True,
        "message": "Book returned successfully!"
    })
# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True
    )