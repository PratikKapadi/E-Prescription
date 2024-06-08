document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login-form').addEventListener('submit', function (event) {
        event.preventDefault();

        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
            .then(response => {
                if (response.ok) {
                    console.log(response.user);
                    console.log(response);

                    window.location.href = '/dashboard_p'; // Redirect to dashboard after successful login
                    return response.json()
                } else {
                    return response.json();
                }
            })
            .then(data => {
                sessionStorage.setItem('user', JSON.stringify(data.user));
                if (data && data.error) {
                    document.getElementById('error-message').textContent = data.error;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});
