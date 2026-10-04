// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const message = document
            .getElementById("message");

        try {

            const response = await fetch("/api/login", {

                method: "POST",

                credentials: "same-origin",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });


            const data = await response.json();

            message.textContent = data.message;


            if (data.success) {

                message.className = "message success";

                // Login successful → dashboard
                window.location.href = "/dashboard";

            } else {

                message.className = "message error";

            }

        } catch (error) {

            message.textContent =
                "Unable to connect to server.";

            message.className = "message error";

            console.error("Login error:", error);

        }

    });

}



// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const message =
                document
                    .getElementById("message");


            try {

                const response =
                    await fetch(
                        "/api/register",
                        {
                            method: "POST",

                            credentials: "same-origin",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                message.textContent =
                    data.message;


                if (data.success) {

                    message.className =
                        "message success";

                    registerForm.reset();


                    setTimeout(function () {

                        window.location.href = "/";

                    }, 1000);

                } else {

                    message.className =
                        "message error";

                }

            } catch (error) {

                message.textContent =
                    "Unable to connect to server.";

                message.className =
                    "message error";

                console.error(
                    "Register error:",
                    error
                );

            }

        }
    );

}