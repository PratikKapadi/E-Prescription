// Prescription Form Submission
document.getElementById('prescriptionForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    console.log(date);
    fetch(`/generatePrescription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: date })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('No prescription data available for the given date');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            console.log(data.data.patientname)
            const prescriptionDiv = document.getElementById('prescription');
            if (!data.data.patientname) {
                prescriptionDiv.innerHTML = '<p>No prescription data available for the given date.</p>';
            } else {
                // Function to format dates
                function formatDateToYYYYMMDD(originalDateString) {
                    const date = new Date(originalDateString);
                    const day = String(date.getDate()).padStart(2, '0');
                    const monthIndex = date.getMonth();
                    const year = date.getFullYear();
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const month = months[monthIndex];
                    return `${day}-${month}-${year}`;
                }
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
                prescriptionDiv.innerHTML = `
                <main>
                <header class="Doctor">
                <div class="clinic_con">
                <img src="/images/logo2.jpg" alt="" srcset="" class="pre_logo" />
                       <div class="dname"><h1 class="Clinic_name">${data.data.clinic_name}</h1>
                        <p>${data.data.doctoraddress}<br>${data.data.mobile_no}</p></div>
                    </div>
                    <div class="name_der">
                        <h2>${"Dr. " + data.data.doctorname}</h2>
                        <p>${"(" + data.data.degree_specialty + ")"}</p>
                    </div>
                </header>
                <section id="patient-info">
                    <div class="p_name">
                        <p>Name: ${data.data.patientname}</p>
                        <p>Age: ${data.data.age}</p>
                    </div>
                    <div class="p_date">
                        <p class="date">Date & Time: ${formatDateToCustomFormat(data.data.d_date_time)}</p>
                        <p class="PatientID">PatientID: ${data.data.patientid}</p>
                    </div>
                </section>
                <section id="prescription_m">
                    <p>Chief Complaints: ${data.data.chief_complaints}</p>
                    <p>Diagnosis: ${data.data.diagnosis}</p>
                    <h2>&#8478</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Sr</th>
                                <th>Medicine Name</th>
                                <th>Regime</th>
                                <th>Instruction</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.data.medicines.map((medicine, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${medicine.medicine_name}</td>
                                    <td>${medicine.regime}</td>
                                    <td>${medicine.instructions}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section><br><br>
                <p class="sig">${"Dr. " + data.data.doctorname}</p>
            </main>
            `;
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            const prescriptionDiv = document.getElementById('prescription');
            prescriptionDiv.innerHTML = `<p>${error.message}</p>`;
        });
});

// Print Prescription Button
// Add event listener to the Print Prescription button
document.getElementById('printButton').addEventListener('click', function () {
    // Hide all elements except for the prescription div
    const elementsToHide = document.querySelectorAll('body > *:not(#prescription)');
    elementsToHide.forEach(element => {
        element.classList.add('print-hidden'); // Add a class to hide elements
    });

    // Print the prescription
    window.print();

    // Show all elements again after printing is complete
    elementsToHide.forEach(element => {
        element.classList.remove('print-hidden'); // Remove the class to show elements
    });
});


