# 📚 LibraVerse — Library Management System

> **A modern, colorful, and user-friendly web-based Library Management System**

## 🔗 Project Links

🌐 **Live Application:** `http://127.0.0.1:5000`


---

## 📌 Project Overview

**LibraVerse** is a web-based Library Management System developed as an individual mini project.

The application provides a convenient platform for managing books, members, book issuing and returning, while also providing secure user authentication and an interactive dashboard.

---

## 🎯 Project Aim

To design and develop a Library Management System web application that enables users to add, search, issue, return, and delete book records using HTML, CSS, JavaScript, Python Flask, and SQLite.

---

## ✨ Key Features

### 🔐 Authentication

* User Registration
* User Login
* Password hashing
* Session-based authentication
* Logout functionality

### 📊 Dashboard

* Total books
* Available books
* Issued books
* Total members
* Library statistics
* Interactive charts

### 📚 Book Management

* Add books
* View books
* Search books
* Edit book details
* Delete books
* Track availability

### 👥 Member Management

* Add members
* View members
* Search members
* Edit member details
* Delete members

### 📤 Issue & Return

* Issue books to members
* Prevent issuing unavailable books
* Return issued books
* Automatically update book availability
* Maintain issue/return records

---

## 🛠️ Technologies Used

| Technology    | Purpose                                |
| ------------- | -------------------------------------- |
| HTML5         | Frontend structure                     |
| CSS3          | Styling and UI                         |
| JavaScript    | Frontend functionality                 |
| Fetch API     | Frontend-backend communication         |
| Python        | Backend programming                    |
| Flask         | Backend framework and REST APIs        |
| SQLite        | Database                               |
| Werkzeug      | Password hashing                       |
| Chart.js      | Data visualization                     |
| Node.js / npm | Frontend tooling                       |
| Git & GitHub  | Version control and project submission |

---

## 🏗️ System Architecture

```text
              👤 USER
                 │
                 ▼
        ┌─────────────────┐
        │    FRONTEND     │
        │ HTML/CSS/JS     │
        └────────┬────────┘
                 │
             Fetch API
                 │
                 ▼
        ┌─────────────────┐
        │ FLASK BACKEND   │
        │   REST APIs     │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │     SQLITE      │
        │    DATABASE     │
        └─────────────────┘
```

---

## 🗄️ Database

The application uses SQLite with the following main tables:

```text
Users
Books
Members
Issued_Books
```

These tables manage authentication, book information, member information, and issue/return records.

---

## 📂 Project Structure

```text
LibraryManagementSystem/
│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── library.db
│   └── requirements.txt
│
├── frontend/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── books.html
│   ├── members.html
│   ├── issue.html
│   ├── return.html
│   ├── style.css
│   └── JavaScript files
│
├── screenshots/
│
└── README.md
```

---

# ▶️ How to Run the Project

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_LINK
```

Open the downloaded project folder in Visual Studio Code.

## 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

## 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

## 4. Run the Application

```bash
python backend/app.py
```

Then open:

```text
http://127.0.0.1:5000
```

---

# 🧪 Testing

The application was tested for:

* User registration
* User login
* Invalid login credentials
* Adding books
* Duplicate ISBN validation
* Searching books
* Issuing available books
* Preventing duplicate book issue
* Returning books
* Deleting books
* Member management
* Searching for unavailable/non-existent records
* Authentication-protected pages

---

# 🎓 Learning Outcomes

This project provided practical understanding of:

* Full-stack web development
* Flask backend development
* REST APIs
* SQLite database management
* CRUD operations
* Authentication
* Password hashing
* Session management
* Fetch API
* JSON communication
* Frontend-backend integration
* Form validation
* Database relationships
* Data visualization
* Git and GitHub

---

## 👩‍💻 Project Details

**Project Name:** LibraVerse — Library Management System
**Project Type:** Individual Mini Project
**Backend:** Python Flask
**Database:** SQLite
**Frontend:** HTML, CSS, JavaScript

---

## 📄 Academic Project

Developed as part of the Web-Based Application Teacher Assessment.

**Submission Deadline:** 8 October 2026

---

### 🔗 Quick Access

🌐 **Open LibraVerse:** `YOUR_LIVE_APPLICATION_LINK`

💻 **View Source Code:** `YOUR_GITHUB_REPOSITORY_LINK`
