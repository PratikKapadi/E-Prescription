document.getElementById('addMedicine').addEventListener('click', function () {
    const medicineList = document.getElementById('medicineList');
    const medicineItem = document.createElement('div');
    medicineItem.classList.add('medicineItem');
    medicineItem.innerHTML = `
        <label for="medicineName">Medicine Name:</label>
        <input type="text" class="medicineName" name="medicineName[]" required><br>
        
        <label for="regime">Regime:</label>
        <input type="text" class="regime" name="regime[]" required><br>
        
        <label for="instructions">Instructions:</label>
        <input type="text" class="instructions" name="instructions[]" required><br>
    `;
    medicineList.appendChild(medicineItem);
});

document.getElementById('prescriptionForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const diagnosis = document.getElementById('diagnosis').value;
    const chiefComplaints = document.getElementById('chiefComplaints').value;
    const patientId = document.getElementById('patientId').value;

    const medicineNameInputs = document.querySelectorAll('.medicineName');
    const regimeInputs = document.querySelectorAll('.regime');
    const instructionsInputs = document.querySelectorAll('.instructions');

    const medicineName = Array.from(medicineNameInputs).map(input => input.value);
    const regime = Array.from(regimeInputs).map(input => input.value);
    const instructions = Array.from(instructionsInputs).map(input => input.value);

    const prescriptionData = {
        diagnosis,
        chiefComplaints,
        patientId,
        medicineName,
        regime,
        instructions
    };

    try {
        const response = await fetch('/prescription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prescriptionData)
        });

        if (response.ok) {
            alert('Prescription submitted successfully!');
            window.location.href = "/createBill"
            // Redirect or do something else on success
        } else {
            alert('Failed to submit prescription. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});
