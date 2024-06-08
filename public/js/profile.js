document.addEventListener('DOMContentLoaded', function () {
    // Retrieve user data from session storage
    const userData = sessionStorage.getItem('user');
    if (!userData) {
        alert('User data not found!');
        return;
    }

    // Parse user data
    const user = JSON.parse(userData);

    // Create HTML elements to display user information
    const profileContainer = document.getElementById('profile');
    const profileHTML = `
        <div>
            <h2>Name: ${user.name}</h2>
            <p>User Id: ${user.id}</p>
            <p>Email: ${user.email}</p>
            <p>Phone: ${user.phone}</p>
            <p>Gender: ${user.gender}</p>
            <p>Date of Birth: ${formatDate(user.dob)}</p>
            <p>Age: ${calculateAge(user.dob)}</p>
        </div>
    `;

    // Append user profile HTML to the profile container
    profileContainer.innerHTML = profileHTML;
});

// Function to format date (e.g., from "2004-04-24T18:30:00.000Z" to "24 April 2004")
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Function to calculate age based on date of birth
function calculateAge(dateString) {
    const dob = new Date(dateString);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
