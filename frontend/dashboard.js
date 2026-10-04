// ==========================================
// LOAD CURRENT USER
// ==========================================

async function loadUser() {

    try {

        const response = await fetch("/api/me", {
            credentials: "same-origin"
        });

        const data = await response.json();


        // IMPORTANT:
        // app.py returns "success", not "logged_in"

        if (!data.success) {

            window.location.href = "/";

            return;
        }


        const userName =
            document.getElementById("userName");

        const userEmail =
            document.getElementById("userEmail");

        const welcomeName =
            document.getElementById("welcomeName");


        if (userName) {
            userName.textContent =
                data.user.name;
        }


        if (userEmail) {
            userEmail.textContent =
                data.user.email;
        }


        if (welcomeName) {
            welcomeName.textContent =
                data.user.name;
        }


    } catch (error) {

        console.error(
            "User loading error:",
            error
        );

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
        async function () {

            try {

                await fetch(
                    "/api/logout",
                    {
                        method: "POST",
                        credentials: "same-origin"
                    }
                );

                window.location.href = "/";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}



// ==========================================
// DASHBOARD STATISTICS
// ==========================================

async function loadDashboardStats() {

    try {

        const response =
            await fetch(
                "/api/dashboard-stats",
                {
                    credentials: "same-origin"
                }
            );

        const data =
            await response.json();


        if (!data.success) {

            console.log(data.message);

            return;
        }


        // Total Books

        const totalBooksElement =
            document.getElementById("totalBooks");

        if (totalBooksElement) {

            totalBooksElement.textContent =
                data.total_books;

        }


        // Total Members

        const totalMembersElement =
            document.getElementById("totalMembers");

        if (totalMembersElement) {

            totalMembersElement.textContent =
                data.total_members;

        }


        // Issued Books

        const issuedBooksElement =
            document.getElementById("issuedBooks");

        if (issuedBooksElement) {

            issuedBooksElement.textContent =
                data.issued_books;

        }


        // Available Books

        const availableBooksElement =
            document.getElementById("availableBooks");

        if (availableBooksElement) {

            availableBooksElement.textContent =
                data.available_books;

        }


        // Returned Books

        const returnedBooksElement =
            document.getElementById("returnedBooks");

        if (returnedBooksElement) {

            returnedBooksElement.textContent =
                data.returned_books;

        }

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );

    }

}



// ==========================================
// RECENT ACTIVITY
// ==========================================

async function loadRecentActivity() {

    const activityContainer =
        document.getElementById(
            "activityContainer"
        );


    if (!activityContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/recent-activity",
                {
                    credentials: "same-origin"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            activityContainer.innerHTML = `
                <div class="activity-empty">
                    Unable to load activity.
                </div>
            `;

            return;
        }


        if (data.activities.length === 0) {

            activityContainer.innerHTML = `
                <div class="activity-empty">

                    <div class="empty-icon">
                        📚
                    </div>

                    <h3>No activity yet</h3>

                    <p>
                        Issue or return a book to see
                        activity here.
                    </p>

                </div>
            `;

            return;
        }


        activityContainer.innerHTML = "";


        data.activities.forEach(activity => {

            const item =
                document.createElement("div");


            item.className =
                "activity-item";


            let statusClass;
            let statusText;
            let activityIcon;


            if (activity.status === "Issued") {

                statusClass =
                    "activity-issued";

                statusText =
                    "📤 Issued";

                activityIcon =
                    "📤";

            } else {

                statusClass =
                    "activity-returned";

                statusText =
                    "📥 Returned";

                activityIcon =
                    "📥";

            }


            const dateText =
                activity.status === "Issued"
                    ? activity.issue_date
                    : activity.return_date;


            item.innerHTML = `

                <div class="activity-icon">
                    ${activityIcon}
                </div>


                <div class="activity-details">

                    <h3>
                        ${activity.book_title}
                    </h3>

                    <p>
                        👤 ${activity.member_name}
                    </p>

                </div>


                <div class="activity-meta">

                    <span
                        class="activity-status ${statusClass}">
                        ${statusText}
                    </span>

                    <small>
                        📅 ${dateText || "-"}
                    </small>

                </div>

            `;


            activityContainer.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Recent activity error:",
            error
        );


        activityContainer.innerHTML = `
            <div class="activity-empty">
                Something went wrong while loading activity.
            </div>
        `;

    }

}



// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

loadUser();

loadDashboardStats();

loadRecentActivity();
// ==========================================
// DASHBOARD CHARTS
// ==========================================

let bookStatusChart;
let categoryChart;


// ==========================================
// BOOK STATUS CHART
// ==========================================

async function loadBookStatusChart() {

    try {

        const response = await fetch("/api/dashboard-stats");

        const data = await response.json();

        if (!data.success) {
            return;
        }

        const canvas =
            document.getElementById("bookStatusChart");

        if (!canvas) {
            return;
        }

        if (bookStatusChart) {
            bookStatusChart.destroy();
        }

        bookStatusChart = new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: [
                    "Available",
                    "Issued"
                ],

                datasets: [{
                    data: [
                        data.available_books,
                        data.issued_books
                    ]
                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        });

    } catch (error) {

        console.error(
            "Book status chart error:",
            error
        );

    }

}


// ==========================================
// CATEGORY CHART
// ==========================================

async function loadCategoryChart() {

    try {

        const response =
            await fetch("/api/books");

        const data =
            await response.json();

        if (!data.success) {
            return;
        }

        const books = data.books || [];

        const categories = {};

        books.forEach(book => {

            const category =
                book.category || "Other";

            if (!categories[category]) {
                categories[category] = 0;
            }

            categories[category]++;

        });


        const labels =
            Object.keys(categories);

        const values =
            Object.values(categories);


        const canvas =
            document.getElementById("categoryChart");

        if (!canvas) {
            return;
        }

        if (categoryChart) {
            categoryChart.destroy();
        }


        if (labels.length === 0) {

            return;
        }


        categoryChart = new Chart(canvas, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [{

                    label: "Number of Books",

                    data: values

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }

                },

                plugins: {

                    legend: {
                        display: false
                    }

                }

            }

        });

    } catch (error) {

        console.error(
            "Category chart error:",
            error
        );

    }

}


// ==========================================
// LOAD CHARTS
// ==========================================

loadBookStatusChart();
loadCategoryChart();