document.getElementById('addItem').addEventListener('click', function () {
    var billItems = document.getElementById('billItems');
    var newItem = document.createElement('div');
    newItem.innerHTML = `
        <label for="particular">Particular:</label><br>
        <input type="text" class="particular" name="particular[]"><br>
        <label for="amount">Amount:</label><br>
        <input type="text" class="amount" name="amount[]"><br>
    `;
    billItems.appendChild(newItem);
});
document.getElementById('billForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var patient_id = document.getElementById('patient_id').value;
    var particulars = Array.from(document.getElementsByClassName('particular')).map(input => input.value);
    var amounts = Array.from(document.getElementsByClassName('amount')).map(input => input.value);
    var bill = { patient_id, particulars, amounts };

    fetch('/createBill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bill),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Bill created successfully');
            } else {
                alert('Error creating bill: ' + data.error);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error creating bill');
        });
});

