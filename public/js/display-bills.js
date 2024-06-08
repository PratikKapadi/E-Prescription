document.addEventListener('DOMContentLoaded', () => {
    const dateForm = document.getElementById('dateForm');
    dateForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(dateForm);
        const date = formData.get('date');

        fetch('/display-bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date: date })
        })
            .then(response => {
                if (!response.ok) {
                    console.log(response);
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.patientDoctorDetails) {
                    console.log(data);
                    displayBillDetails(data);
                } else {
                    displayNoBillDetailsMessage();
                }
            })
            .catch(error => {
                console.error('Error fetching bill details:', error);
                displayErrorMessage();
            });
    });
});
function displayBillDetails(data) {
    const { patientDoctorDetails, bills } = data;

    function formatDateToCustomFormat(originalDateString) {
        const date = new Date(originalDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = months[monthIndex];
        const formattedDate = `${day}-${month}-${year}`;
        const hours = date.getHours() % 12 || 12;
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const period = date.getHours() < 12 ? 'AM' : 'PM';
        const formattedTime = `${hours}:${minutes}${period}`;
        return `${day}-${month}-${year};${hours}:${minutes}${period}`;
    }

    const billDetailsContainer = document.getElementById('billDetails');
    billDetailsContainer.innerHTML = '';

    // Display patient and doctor details
    const patientInfo = `
        <header class="Doctor">
            <div class="clinic_con">
                <img src="/images/logo2.jpg" alt="" srcset="" class="pre_logo" />
                <div class="dname">
                    <h1 class="Clinic_name">${patientDoctorDetails.clinic_name}</h1>
                    <p>${patientDoctorDetails.address}<br>${patientDoctorDetails.mobile_no}</p>
                </div>
            </div>
            <div class="name_der">
                <h2>${"Dr. " + patientDoctorDetails.doctorname}</h2>
                <p>${"(" + patientDoctorDetails.degree_specialty + ")"}</p>
            </div>
        </header>
        <section id="patient-info">
            <div class="p_name">
                <p>Name: ${patientDoctorDetails.patientname}</p>
                <p>Age: ${patientDoctorDetails.age}</p>
            </div>
            <div class="p_date">
                <p class="date">Date & Time: ${formatDateToCustomFormat(bills[0].created_at)}</p>
                <p class="PatientID">PatientID: ${patientDoctorDetails.id}</p>
            </div>
        </section>
        <table>
            <thead>
                <tr>
                    <th>Sr</th>
                    <th>Particulars</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
    `;

    billDetailsContainer.innerHTML += patientInfo;

    let totalAmount = 0;
    bills.forEach((bill, index) => {
        const billElement = document.createElement('tr');

        const amount = parseFloat(bill.amount); // Convert amount to float for accurate sum
        totalAmount += amount;

        billElement.innerHTML = `
            <td>${index + 1}</td>
            <td>${bill.particular}</td>
            <td>${amount.toFixed(2)}</td>
        `;

        billDetailsContainer.querySelector('tbody').appendChild(billElement);
    });

    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td colspan="2"><strong>Total</strong></td>
        <td><strong>${totalAmount.toFixed(2)}</strong></td>
    `;
    billDetailsContainer.querySelector('tbody').appendChild(totalRow);

    if (bills.length === 0) {
        displayNoBillDetailsMessage();
    }
}

function displayNoBillDetailsMessage() {
    const billDetailsContainer = document.getElementById('billDetails');
    billDetailsContainer.innerHTML = '<p>No bill details found for the specified date.</p>';
}

function displayErrorMessage() {
    const billDetailsContainer = document.getElementById('billDetails');
    billDetailsContainer.innerHTML = '<p>An error occurred while fetching bill details.</p>';
}

function printBillDetails() {
    // Clone the billDetails section
    const billDetailsContainer = document.getElementById('billDetails');
    const billDetailsClone = billDetailsContainer.cloneNode(true);

    // Create a temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow.document;

    // Write the billDetails content to the iframe
    iframeDoc.open();
    iframeDoc.write('<html><head><title>Print</title>');

    // Include CSS stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(sheet => {
        iframeDoc.write(`<link rel="stylesheet" href="${sheet.href}">`);
    });

    iframeDoc.write('</head><body>');
    iframeDoc.write(billDetailsClone.innerHTML);
    iframeDoc.write('</body></html>');
    iframeDoc.close();

    // Wait for the iframe content to load
    iframe.onload = function () {
        // Print the iframe content
        iframe.contentWindow.print();

        // Remove the iframe after printing
        document.body.removeChild(iframe);
    };
}

document.getElementById('printButton').addEventListener('click', printBillDetails);
