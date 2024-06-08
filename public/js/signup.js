function submitForm() {
    var name = document.getElementById('name').value;
    var dob = document.getElementById('dob').value;
    var gender = document.getElementById('gender').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var password = document.getElementById('password').value;

    // Calculate age
    var dobDate = new Date(dob);
    var today = new Date();
    var age = today.getFullYear() - dobDate.getFullYear();
    var monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    // Create JSON object with user data
    var userData = {
        name: name,
        dob: dob,
        gender: gender,
        email: email,
        phone: phone,
        age: age,
        password: password
    };

    // Send data to Node.js server
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (response.ok) {
                console.log('User registered successfully');
                window.location.href = '/'; // Redirect to homepage
            } else {
                console.error('Failed to register user');
                document.getElementById('error-message').textContent = "User already exists";


                // Handle error, show error message to the user, etc.
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
