const issueForm =
    document.getElementById("issueForm");

const issueBook =
    document.getElementById("issueBook");

const issueMember =
    document.getElementById("issueMember");

const issueDate =
    document.getElementById("issueDate");

const issueMessage =
    document.getElementById("issueMessage");

const issuedContainer =
    document.getElementById("issuedContainer");


// ==========================================
// SET TODAY'S DATE
// ==========================================

const today =
    new Date().toISOString().split("T")[0];

issueDate.value = today;


// ==========================================
// LOAD AVAILABLE BOOKS
// ==========================================

async function loadAvailableBooks() {

    try {

        const response =
            await fetch("/api/books");

        const data =
            await response.json();


        issueBook.innerHTML = `
            <option value="">
                Select a book
            </option>
        `;


        if (!data.success) {
            return;
        }


        data.books
            .filter(book => book.status === "Available")
            .forEach(book => {

                const option =
                    document.createElement("option");

                option.value = book.id;

                option.textContent =
                    `${book.title} — ${book.author}`;

                issueBook.appendChild(option);

            });


    } catch (error) {

        console.error(error);

        issueBook.innerHTML = `
            <option value="">
                Unable to load books
            </option>
        `;
    }
}


// ==========================================
// LOAD MEMBERS
// ==========================================

async function loadMembers() {

    try {

        const response =
            await fetch("/api/members");

        const data =
            await response.json();


        issueMember.innerHTML = `
            <option value="">
                Select a member
            </option>
        `;


        if (!data.success) {
            return;
        }


        data.members.forEach(member => {

            const option =
                document.createElement("option");

            option.value = member.id;

            option.textContent =
                `${member.name} — ${member.email}`;

            issueMember.appendChild(option);

        });


    } catch (error) {

        console.error(error);

        issueMember.innerHTML = `
            <option value="">
                Unable to load members
            </option>
        `;
    }
}


// ==========================================
// LOAD ISSUED BOOKS
// ==========================================

async function loadIssuedBooks() {

    try {

        const response =
            await fetch("/api/issued-books");

        const data =
            await response.json();


        if (!data.success) {

            issuedContainer.innerHTML =
                "<p>Please login first.</p>";

            return;
        }


        document.getElementById(
            "issuedCount"
        ).textContent =
            `${data.issued_books.length} book(s) currently issued`;


        if (data.issued_books.length === 0) {

            issuedContainer.innerHTML = `

                <div class="empty-books">

                    <div>📚</div>

                    <h3>
                        No books currently issued
                    </h3>

                    <p>
                        All books are currently available.
                    </p>

                </div>

            `;

            return;
        }


        issuedContainer.innerHTML =
            data.issued_books.map(item => `

                <div class="book-card">

                    <div class="book-cover">
                        📤
                    </div>

                    <h3>
                        ${item.book_title}
                    </h3>

                    <p class="book-author">
                        Issued to ${item.member_name}
                    </p>

                    <div class="book-info">

                        <p>
                            <strong>📧 Member:</strong>
                            ${item.member_email}
                        </p>

                        <p>
                            <strong>📅 Issue Date:</strong>
                            ${item.issue_date}
                        </p>

                        <span class="book-status status-issued">
                            Issued
                        </span>

                    </div>

                </div>

            `).join("");


    } catch (error) {

        console.error(error);

        issuedContainer.innerHTML =
            "<p>Unable to load issued books.</p>";
    }
}


// ==========================================
// ISSUE BOOK
// ==========================================

issueForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const data = {

            book_id:
                issueBook.value,

            member_id:
                issueMember.value,

            issue_date:
                issueDate.value

        };


        try {

            const response =
                await fetch(
                    "/api/issue-book",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)
                    }
                );


            const result =
                await response.json();


            issueMessage.textContent =
                result.message;


            if (result.success) {

                issueMessage.className =
                    "message success";

                issueForm.reset();

                issueDate.value = today;

                await loadAvailableBooks();

                await loadIssuedBooks();

            } else {

                issueMessage.className =
                    "message error";
            }


        } catch (error) {

            console.error(error);

            issueMessage.textContent =
                "Unable to connect to server.";

            issueMessage.className =
                "message error";
        }

    }
);


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

loadAvailableBooks();
loadMembers();
loadIssuedBooks();