const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");
const searchBook = document.getElementById("searchBook");
const bookMessage = document.getElementById("bookMessage");


// ==========================================
// LOAD BOOKS
// ==========================================

async function loadBooks(search = "") {

    try {

        const response = await fetch(
            `/api/books?search=${encodeURIComponent(search)}`
        );

        const data = await response.json();

        if (!data.success) {

            booksContainer.innerHTML =
                "<p>Please login first.</p>";

            return;
        }

        displayBooks(data.books);

    } catch (error) {

        console.error(error);

        booksContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// ==========================================
// DISPLAY BOOKS
// ==========================================

function displayBooks(books) {

    document.getElementById("bookCount").textContent =
        `${books.length} book(s) found`;


    if (books.length === 0) {

        booksContainer.innerHTML = `
            <div class="empty-books">

                <div>📖</div>

                <h3>No books found</h3>

                <p>
                    Add your first book to your collection.
                </p>

            </div>
        `;

        return;
    }


    booksContainer.innerHTML = books.map(book => `

        <div class="book-card">

            <div class="book-cover">
                📖
            </div>

            <h3>${book.title}</h3>

            <p class="book-author">
                by ${book.author}
            </p>

            <div class="book-info">

                <p>
                    <strong>ISBN:</strong>
                    ${book.isbn}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${book.category}
                </p>

                <span class="
                    book-status
                    ${book.status === "Available"
                        ? "status-available"
                        : "status-issued"}
                ">
                    ${book.status}
                </span>

            </div>

            <div class="book-actions">

                <button
                    class="edit-btn"
                    onclick="editBook(${book.id})"
                >
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteBook(${book.id})"
                >
                    🗑️ Delete
                </button>

            </div>

        </div>

    `).join("");
}


// ==========================================
// ADD BOOK
// ==========================================

bookForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const book = {

            title:
                document.getElementById("bookTitle").value.trim(),

            author:
                document.getElementById("bookAuthor").value.trim(),

            isbn:
                document.getElementById("bookIsbn").value.trim(),

            category:
                document.getElementById("bookCategory").value

        };


        try {

            const response = await fetch(
                "/api/books",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(book)
                }
            );


            const data = await response.json();


            bookMessage.textContent = data.message;


            if (data.success) {

                bookMessage.className =
                    "message success";

                bookForm.reset();

                loadBooks();

            } else {

                bookMessage.className =
                    "message error";
            }


        } catch (error) {

            console.error(error);

            bookMessage.textContent =
                "Unable to connect to server.";

            bookMessage.className =
                "message error";
        }

    }
);


// ==========================================
// SEARCH
// ==========================================

searchBook.addEventListener(
    "input",
    function() {

        loadBooks(
            searchBook.value.trim()
        );

    }
);


// ==========================================
// DELETE BOOK
// ==========================================

async function deleteBook(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this book?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/books/${id}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();

        alert(data.message);

        loadBooks();

    } catch (error) {

        console.error(error);

    }
}


// ==========================================
// EDIT BOOK
// ==========================================

async function editBook(id) {

    const newTitle = prompt(
        "Enter the new book title:"
    );


    if (!newTitle) {
        return;
    }


    try {

        const response = await fetch(
            `/api/books/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: newTitle
                })
            }
        );


        const data = await response.json();

        alert(data.message);

        loadBooks();

    } catch (error) {

        console.error(error);

    }
}


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            await fetch(
                "/api/logout",
                {
                    method: "POST"
                }
            );

            window.location.href = "/";
        }
    );
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadBooks();