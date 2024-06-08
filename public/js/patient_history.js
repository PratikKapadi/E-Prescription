const searchButton = document.getElementById('search-button');
const historyContainer = document.getElementById('history-container');

searchButton.addEventListener('click', async () => {
    const patientId = document.getElementById('patient-id').value;

    try {
        const response = await fetch(`/patient-history/${patientId}`);
        const data = await response.json();

        if (data.error) {
            // Handle errors gracefully, e.g., display error message to user
            alert(data.error);
            return;
        }

        historyContainer.innerHTML = ''; // Clear previous results
        displayHistory(data.history);
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again later.');
    }
});
function displayHistory(history) {
    const table = document.createElement('table');
    table.classList.add('history-table'); // Optional styling class

    const tableHead = document.createElement('thead');
    const tableRow = document.createElement('tr');

    tableRow.appendChild(createTableCell('Date'));
    tableRow.appendChild(createTableCell('Time'));
    tableRow.appendChild(createTableCell('Diagnosis'));
    tableRow.appendChild(createTableCell('Chief Complaints'));
    tableRow.appendChild(createTableCell('View Medicine'));


    tableHead.appendChild(tableRow);
    table.appendChild(tableHead);

    const tableBody = document.createElement('tbody');

    history.sort((a, b) => { // Sort by date_time (descending by default)
        return new Date(b.diagnosis.date_time) - new Date(a.diagnosis.date_time);
    });

    history.forEach(entry => {
        const tableRow = document.createElement('tr');

        // Parse date and time
        const dateTime = new Date(entry.diagnosis.date_time);
        const date = dateTime.toLocaleDateString();
        const time = dateTime.toLocaleTimeString();

        // Populate diagnosis information
        tableRow.appendChild(createTableCell(date));
        tableRow.appendChild(createTableCell(time));
        tableRow.appendChild(createTableCell(entry.diagnosis.diagnosis));
        tableRow.appendChild(createTableCell(entry.diagnosis.chief_complaints));

        // View Prescription button
        const viewButton = createButton('View Medicine', 'view-prescription');
        viewButton.addEventListener('click', () => {
            displayPrescription(entry.medicines);
        });
        const viewButtonCell = createTableCell('');
        viewButtonCell.appendChild(viewButton);
        tableRow.appendChild(viewButtonCell);


        tableBody.appendChild(tableRow);
    });

    table.appendChild(tableBody);
    historyContainer.appendChild(table);
}

function createTableCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    return button;
}
function displayPrescription(medicines) {
    const prescriptionTable = document.createElement('table');
    prescriptionTable.classList.add('prescription-table');

    // Create table header
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Medicine Name</th>
        <th>Regime</th>
        <th>Instructions</th>
    `;
    tableHeader.appendChild(headerRow);
    prescriptionTable.appendChild(tableHeader);

    // Create table body
    const tableBody = document.createElement('tbody');
    medicines.forEach(medicine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${medicine.medicine_name}</td>
            <td>${medicine.regime}</td>
            <td>${medicine.instructions}</td>
        `;
        tableBody.appendChild(row);
    });
    prescriptionTable.appendChild(tableBody);

    // Append the table to the prescription container
    const prescriptionContainer = document.getElementById('prescription-container');
    prescriptionContainer.innerHTML = ''; // Clear previous content
    prescriptionContainer.appendChild(prescriptionTable);
}
