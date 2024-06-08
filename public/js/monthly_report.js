const reportForm = document.getElementById('report-form');
const reportContainer = document.getElementById('report-container');
let total = 0;

reportForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;

    try {
        const response = await fetch('/monthly-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month, year })
        });

        const data = await response.json();
        console.log(data);
        if (data.error) {
            alert(data.error);
            return;
        }

        reportContainer.innerHTML = ''; // Clear previous results
        displayReport(data);
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again later.');
    }
});

function formatDateToCustomFormat(originalDateString) {
    const date = new Date(originalDateString);

    // Format the date to "dd-mmm-yyyy; hh:mmA"
    const day = String(date.getDate()).padStart(2, '0');
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[monthIndex];
    const formattedDate = `${day}-${month}-${year}`;

    // Format the time to "hh:mmA"
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = date.getHours() < 12 ? 'AM' : 'PM';
    const formattedTime = `${hours}:${minutes}${period}`;

    return `${formattedDate}; ${formattedTime}`;
}

function displayReport(monthlyReport) {
    console.log(monthlyReport);
    const table = document.createElement('table');
    const tableHead = document.createElement('thead');
    const tableBody = document.createElement('tbody');

    // Create table header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Serial No.</th><th>Patient Name</th><th>Age</th><th>Diagnosis</th><th>Chief Complaints</th><th>Appointment Date</th><th>Amount</th>';
    tableHead.appendChild(headerRow);
    table.appendChild(tableHead);

    // Initialize total as a number
    let total = 0;

    // Check if monthlyReport is defined and not null
    if (!monthlyReport || Object.keys(monthlyReport).length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.setAttribute('colspan', '7'); // Changed colspan to 7 since there are 7 columns
        emptyCell.textContent = 'No data available';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
    } else {
        let serialNumber = 1;
        // Create table body
        Object.values(monthlyReport).forEach(patient => {
            const patientName = patient.name;
            const patientAge = patient.age;
            const appointments = patient.appointments;
            const amount = patient.totalAmount;
            appointments.forEach(appointment => {
                const { date_time, diagnosis, chief_complaints } = appointment;
                const row = document.createElement('tr');
                row.innerHTML = `<td>${serialNumber}</td><td>${patientName}</td><td>${patientAge}</td><td>${diagnosis}</td><td>${chief_complaints}</td><td>${formatDateToCustomFormat(date_time)}</td><td>${"₹" + amount}</td>`;
                tableBody.appendChild(row);
                total += parseFloat(amount); // Ensure numeric addition
                serialNumber++;
            });
        });

        // Create the "Total" row
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `<td colspan="6">Total</td><td>${total.toFixed(2)}</td>`; // Set colspan to 6 for the first cell and fix total to 2 decimal places
        tableBody.appendChild(totalRow);
    }

    table.appendChild(tableBody);
    reportContainer.appendChild(table);
}





// const reportForm = document.getElementById('report-form');
// const reportContainer = document.getElementById('report-container');

// reportForm.addEventListener('submit', async (event) => {
//     event.preventDefault(); // Prevent default form submission

//     const month = document.getElementById('month').value;
//     const year = document.getElementById('year').value;

//     try {
//         const response = await fetch('/monthly-report', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ month, year })
//         });

//         const data = await response.json();
//         console.log(data);
//         if (data.error) {
//             alert(data.error);
//             return;
//         }

//         reportContainer.innerHTML = ''; // Clear previous results
//         displayReport(data.monthlyReport);
//     } catch (error) {
//         console.error(error);
//         alert('An error occurred. Please try again later.');
//     }
// });
// function formatDateToCustomFormat(originalDateString) {
//     const date = new Date(originalDateString);

//     // Format the date to "dd-mmm-yyyy"
//     const day = String(date.getDate()).padStart(2, '0');
//     const monthIndex = date.getMonth();
//     const year = date.getFullYear();
//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const month = months[monthIndex];
//     const formattedDate = `${day}-${month}-${year}`;

//     // Format the time to "hh:mmA"
//     const hours = date.getHours() % 12 || 12;
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const period = date.getHours() < 12 ? 'AM' : 'PM';
//     const formattedTime = `${hours}:${minutes}${period}`;

//     return `${day}-${month}-${year}; ${hours}:${minutes}${period}`;
// }
// function displayReport(monthlyReport) {
//     const table = document.createElement('table');
//     const tableHead = document.createElement('thead');
//     const tableBody = document.createElement('tbody');

//     // Create table header
//     const headerRow = document.createElement('tr');
//     headerRow.innerHTML = '<th>Serial No.</th><th>Patient Name</th><th>Age</th><th>Diagnosis</th><th>Chief Complaints</th><th>Appointment Date</th>';
//     tableHead.appendChild(headerRow);
//     table.appendChild(tableHead);

//     // Check if monthlyReport object is empty
//     if (Object.keys(monthlyReport).length === 0) {
//         const emptyRow = document.createElement('tr');
//         const emptyCell = document.createElement('td');
//         emptyCell.setAttribute('colspan', '6');
//         emptyCell.textContent = 'No data available';
//         emptyRow.appendChild(emptyCell);
//         tableBody.appendChild(emptyRow);
//     } else {
//         let serialNumber = 1;
//         // Create table body
//         Object.values(monthlyReport).forEach(patient => {
//             const patientName = patient.name;
//             console.log(patientName.totalAmount);
//             const patientAge = patient.age;
//             const appointments = patient.appointments;
//             appointments.forEach(appointment => {
//                 const { date_time, diagnosis, chief_complaints } = appointment;
//                 const row = document.createElement('tr');
//                 row.innerHTML = `<td>${serialNumber}</td><td>${patientName}</td><td>${patientAge}</td><td>${diagnosis}</td><td>${chief_complaints}</td><td>${formatDateToCustomFormat(date_time)}</td>`;
//                 tableBody.appendChild(row);
//                 serialNumber++;
//             });
//         });
//     }

//     table.appendChild(tableBody);
//     reportContainer.appendChild(table);
// }

