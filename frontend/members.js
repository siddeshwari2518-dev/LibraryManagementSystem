const memberForm =
    document.getElementById("memberForm");

const membersContainer =
    document.getElementById("membersContainer");

const searchMember =
    document.getElementById("searchMember");

const memberMessage =
    document.getElementById("memberMessage");


// ==========================================
// LOAD MEMBERS
// ==========================================

async function loadMembers(search = "") {

    try {

        const response = await fetch(
            `/api/members?search=${encodeURIComponent(search)}`
        );

        const data = await response.json();

        if (!data.success) {

            membersContainer.innerHTML =
                "<p>Please login first.</p>";

            return;
        }

        displayMembers(data.members);

    } catch (error) {

        console.error(error);

        membersContainer.innerHTML =
            "<p>Unable to connect to server.</p>";
    }
}


// ==========================================
// DISPLAY MEMBERS
// ==========================================

function displayMembers(members) {

    document.getElementById(
        "memberCount"
    ).textContent =
        `${members.length} member(s) found`;


    if (members.length === 0) {

        membersContainer.innerHTML = `

            <div class="empty-books">

                <div>👥</div>

                <h3>
                    No members found
                </h3>

                <p>
                    Add your first library member.
                </p>

            </div>

        `;

        return;
    }


    membersContainer.innerHTML =
        members.map(member => `

            <div class="book-card member-card">

                <div class="book-cover">
                    👤
                </div>


                <h3>
                    ${member.name}
                </h3>


                <p class="book-author">
                    ${member.email}
                </p>


                <div class="book-info">

                    <p>
                        <strong>📱 Phone:</strong>
                        ${member.phone}
                    </p>

                    <p>
                        <strong>🆔 Member ID:</strong>
                        MEM${String(member.id).padStart(3, "0")}
                    </p>

                </div>


                <div class="book-actions">

                    <button
                        class="edit-btn"
                        onclick="editMember(${member.id})"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteMember(${member.id})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>

        `).join("");
}


// ==========================================
// ADD MEMBER
// ==========================================

memberForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const member = {

            name:
                document.getElementById(
                    "memberName"
                ).value.trim(),

            email:
                document.getElementById(
                    "memberEmail"
                ).value.trim(),

            phone:
                document.getElementById(
                    "memberPhone"
                ).value.trim()

        };


        try {

            const response = await fetch(
                "/api/members",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(member)
                }
            );


            const data =
                await response.json();


            memberMessage.textContent =
                data.message;


            if (data.success) {

                memberMessage.className =
                    "message success";

                memberForm.reset();

                loadMembers();

            } else {

                memberMessage.className =
                    "message error";
            }


        } catch (error) {

            console.error(error);

            memberMessage.textContent =
                "Unable to connect to server.";

            memberMessage.className =
                "message error";
        }

    }
);


// ==========================================
// SEARCH MEMBERS
// ==========================================

searchMember.addEventListener(
    "input",
    function() {

        loadMembers(
            searchMember.value.trim()
        );

    }
);


// ==========================================
// DELETE MEMBER
// ==========================================

async function deleteMember(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this member?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/members/${id}`,
            {
                method: "DELETE"
            }
        );


        const data =
            await response.json();


        alert(data.message);


        loadMembers();


    } catch (error) {

        console.error(error);
    }
}


// ==========================================
// EDIT MEMBER
// ==========================================

async function editMember(id) {

    const newName = prompt(
        "Enter the new member name:"
    );


    if (!newName) {
        return;
    }


    try {

        const response = await fetch(
            `/api/members/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    name: newName
                })
            }
        );


        const data =
            await response.json();


        alert(data.message);


        loadMembers();


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

loadMembers();