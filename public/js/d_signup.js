// doctor_registration.js
document.getElementById('doctorForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        clinicName: document.getElementById('clinicName').value,
        mobileNo: document.getElementById('mobileNo').value,
        email: document.getElementById('email').value,
        degreeSpecialty: document.getElementById('degreeSpecialty').value,
        password: document.getElementById('password').value
    };

    fetch('/d_signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (response.ok) {
                alert('Doctor registration successful!');
                window.location.href = '/d_login';
            } else {
                throw new Error('Server response not OK');
                document.getElementById('error-message').textContent = 'Failed to register doctor. Please try again.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('error-message').textContent = 'An error occurred. Please try again later.';
        });
});
