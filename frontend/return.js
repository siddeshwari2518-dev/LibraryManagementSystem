const returnContainer = document.getElementById("returnContainer");
const returnCount = document.getElementById("returnCount");
const logoutBtn = document.getElementById("logoutBtn");


async function loadIssuedBooks() {

    try {

        const response = await fetch("/api/issued-books");

        const data = await response.json();

        if (!data.success) {
            return;
        }

        returnContainer.innerHTML = "";

        returnCount.textContent =
            `${data.issued_books.length} books currently issued`;


        if (data.issued_books.length === 0) {

            returnContainer.innerHTML = `
                <div class="empty-state">
                    <h3>🎉 No books are currently issued</h3>
                    <p>All books have been returned.</p>
                </div>
            `;

            return;
        }


        data.issued_books.forEach(book => {

            const card = document.createElement("div");

            card.className = "book-card";

            card.innerHTML = `

                <div class="book-card-icon">
                    📖
                </div>

                <div class="book-card-content">

                    <h3>${book.book_title}</h3>

                    <p>
                        👤 <strong>${book.member_name}</strong>
                    </p>

                    <p>
                        📧 ${book.member_email}
                    </p>

                    <p>
                        📅 Issued: ${book.issue_date}
                    </p>

                    <span class="status-badge issued">
                        Issued
                    </span>

                </div>

                <button
                    class="delete-btn"
                    onclick="returnBook(${book.id})">
                    📥 Return
                </button>

            `;

            returnContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Error loading issued books:", error);

    }
}



async function returnBook(issueId) {

    const confirmReturn = confirm(
        "Are you sure you want to return this book?"
    );

    if (!confirmReturn) {
        return;
    }


    try {

        const response = await fetch(
            `/api/return-book/${issueId}`,
            {
                method: "PUT"
            }
        );

        const data = await response.json();


        if (data.success) {

            alert("📚 Book returned successfully!");

            loadIssuedBooks();

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error("Return error:", error);

        alert("Something went wrong.");

    }

}



logoutBtn.addEventListener("click", async () => {

    await fetch("/api/logout", {
        method: "POST"
    });

    window.location.href = "/login.html";

});


loadIssuedBooks();