const express = require('express');
const mysql = require('mysql2/promise'); // Importing mysql2/promise
const session = require('express-session');
const path = require('path');
const moment = require('moment');
const ejs = require('ejs');

const app = express();
const PORT = 3000;

// MySQL connection pool
const pool = mysql.createPool({

    host: 'localhost',
    user: 'root',
    password: 'pratik',
    database: 'eprescription'
});
// Session middleware
app.use(session({
    secret: '3c51b2381hjbsahgihdi4313df1ds5f1s31s5dd1dad9a04b63a6d83f72612eb001c81a7cca39e1a1068d6b189ce8e7ae6fcbdc778e2153eff1890bbfb01be6164619d2', // Change this to a random string
    resave: false,
    saveUninitialized: false
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/helth_tips', (req, res) => {
    res.sendFile(path.join(__dirname, 'helth_tips.html'));
});
app.get('/about_p', (req, res) => {
    res.sendFile(path.join(__dirname, 'about_p.html'));
});
// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve signup.html
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});
app.get('/generatePrescription', (req, res) => {
    res.sendFile(__dirname + '/get_prescription.html');
});
app.get('/dashboard_p', (req, res) => {
    res.sendFile(__dirname + '/dashboard_p.html');
});
app.get('/display-bills', (req, res) => {
    res.sendFile(__dirname + '/display-bills.html');
});
app.get('/about_p', (req, res) => {
    res.sendFile(__dirname + '/about_p.html');
});
app.get('/complaint', (req, res) => {
    res.sendFile(__dirname + '/complaint.html');
});
app.get('/profile', (req, res) => {
    res.sendFile(__dirname + '/profile.html');
});


// Route for handling login requests
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows, fields] = await pool.execute('SELECT * FROM patient WHERE email = ? AND password = ?', [email, password]);
        if (rows.length === 1) {
            req.session.user = rows[0];
            res.status(200).json({ user: req.session.user })
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route for signup form submission
app.post('/signup', async (req, res) => {
    const userData = req.body;
    // Check if user already exists
    const [existingUsers] = await pool.execute('SELECT * FROM patient WHERE email = ?', [userData.email]);
    if (existingUsers.length > 0) {
        // User already exists, send a response to the client
        return res.status(409).json({ error: 'User already exists' });
    }

    // Insert user data into the database
    try {
        const [rows, fields] = await pool.execute('INSERT INTO patient (name, dob, gender, email, phone, age, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userData.name, userData.dob, userData.gender, userData.email, userData.phone, userData.age, userData.password]);
        console.log('User registered successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error inserting user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Assuming you are using Express.js
app.post('/generatePrescription', async (req, res) => {
    try {
        // Extract the date parameter from the request body
        const { date } = req.body;

        // Parse the date string into a Moment.js object and format it to match MySQL's date format (YYYY-MM-DD)
        const formattedDate = moment(date).format('YYYY-MM-DD');

        // Assuming you have implemented session management and stored the user's ID in req.session.user.id
        const patient_id = req.session.user.id;
        // const patient_id = req.session.user.id;

        // Define the SQL query to fetch the prescription details
        const query = `
            SELECT d.name AS doctorname, d.address, d.clinic_name, d.mobile_no, d.email, 
                   d.degree_specialty, p.name AS patientname, p.dob, p.age, p.gender, 
                   m.medicine_name, m.regime, m.instructions, dia.diagnosis, dia.chief_complaints,dia.date_time, m.date_time
            FROM medicine m
            INNER JOIN doctors d ON m.doctor_id = d.id
            INNER JOIN patient p ON m.patient_id = p.id
            INNER JOIN diagnosis dia ON m.diagnosis_id = dia.id
            WHERE DATE(m.date_time) = ? AND m.patient_id = ?
        `;

        // Execute the SQL query with the formatted date and patient ID
        const [result] = await pool.query(query, [formattedDate, patient_id]);

        if (result.length > 0) {
            // Format the result data as needed
            const prescription = {
                patientname: result[0].patientname,
                patientid: patient_id,
                doctorname: result[0].doctorname,
                clinic_name: result[0].clinic_name,
                mobile_no: result[0].mobile_no,
                doctoraddress: result[0].address,
                email: result[0].email,
                degree_specialty: result[0].degree_specialty,
                dob: result[0].dob,
                age: result[0].age,
                gender: result[0].gender,
                diagnosis: result[0].diagnosis,
                chief_complaints: result[0].chief_complaints,
                d_date_time: result[0].date_time,
                medicines: result.map(entry => ({
                    medicine_name: entry.medicine_name,
                    regime: entry.regime,
                    instructions: entry.instructions,
                    date_time: entry.date_time
                }))
            };
            // console.log(prescription);
            res.status(200).json({ data: prescription });
        } else {
            res.status(404).json({ error: 'Prescription not found for the given date' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/display-bills', async (req, res) => {
    try {
        const patientId = req.session.user.id; // Retrieve patient ID from session
        // const patientId = 3; // Retrieve patient ID from session
        const { date } = req.body; // Get date from user input

        const connection = await pool.getConnection();

        // Execute SQL Query to fetch bills
        const [bills] = await connection.execute(`
            SELECT doctor_id, particular, amount, created_at
            FROM bills
            WHERE DATE(created_at) = ? AND patient_id= ?
        `, [date, patientId]);

        // Check if bills array is empty
        if (bills.length === 0) {
            return res.status(404).json({ error: 'No bills found for this patient and date' });
        }

        // Execute SQL Query to fetch patient and doctor details
        let doctor_id = bills[0].doctor_id;
        const [patientDoctorDetails] = await connection.execute(`
            SELECT d.name AS doctorname, d.address, d.clinic_name, d.mobile_no, d.email, 
            d.degree_specialty, p.id, p.name AS patientname, p.dob, p.age, p.gender
            FROM doctors d
            INNER JOIN patient p ON d.id = ?
            WHERE p.id = ?
        `, [doctor_id, patientId]);

        // Close connection
        // await connection.release();

        if (patientDoctorDetails.length === 0) {
            return res.status(404).json({ error: 'Patient or doctor details not found' });
        }

        // Return data in JSON format
        res.json({ patientDoctorDetails: patientDoctorDetails[0], bills });
    } catch (error) {
        console.error('Error fetching bill details:', error);
        res.status(500).send('An error occurred while fetching bill details.');
    }
});








//Doctor
app.get('/about_d', (req, res) => {
    res.sendFile(path.join(__dirname, 'about_d.html'));
});
// Ensure to require necessary modules and setup database connection pool
app.get('/d_signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'd_signup.html'));
});

app.get('/d_login', (req, res) => {
    res.sendFile(__dirname + '/d_login.html');
});
// app.set('view engine', 'ejs');
app.get('/patient-history', (req, res) => {
    res.sendFile(__dirname + '/patient_history.html');
});
app.get('/monthly-report', (req, res) => {
    res.sendFile(__dirname + '/monthly_report.html');
});
app.get('/dashboard_d', (req, res) => {
    res.sendFile(__dirname + '/dashboard_d.html');
});
app.get('/prescription', (req, res) => {
    res.sendFile(__dirname + '/prescription.html');
});
app.get('/createBill', (req, res) => {
    res.sendFile(__dirname + '/c_bill.html');
});

//doctor registration
app.post('/d_signup', async (req, res) => {
    try {
        const formData = req.body;
        const connection = await pool.getConnection();
        const [result] = await connection.execute('INSERT INTO doctors (name, address, clinic_name, mobile_no, email, degree_specialty, password) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            formData.name,
            formData.address,
            formData.clinicName,
            formData.mobileNo,
            formData.email,
            formData.degreeSpecialty,
            formData.password
        ]);
        // connection.release(); // Release the connection after executing the query
        console.log('User registered successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error registering doctor:', error);
        res.status(500).send('Failed to register doctor. Please try again.');
    }
});

// Ensure correct route for serving doctor registration form
app.post('/d_login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM doctors WHERE email = ? AND password = ?', [email, password]);
        connection.release();

        if (rows.length === 1) {
            // Store user information in session
            req.session.user = rows[0];
            res.sendStatus(200); // Login successful
        } else {
            res.status(401).send('Invalid email or password'); // Unauthorized
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});
const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
//prescription create
app.post('/prescription', async (req, res) => {
    const { diagnosis, chiefComplaints, patientId, medicineName, regime, instructions } = req.body;
    const doctorId = parseInt(req.session.user.id); // Retrieve doctor_id from session

    try {
        // Check if diagnosis, chief complaints, patient ID, and at least one medicine are provided
        if (!diagnosis || !chiefComplaints || !patientId || !medicineName.length) {
            throw new Error('Required fields are missing');
        }

        const connection = await pool.getConnection();
        // const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Current date and time
        // Insert diagnosis
        const [diagnosisResult] = await connection.execute('INSERT INTO diagnosis (diagnosis, chief_complaints, patient_id, doctor_id, date_time) VALUES (?, ?, ?, ?, ?)', [diagnosis, chiefComplaints, patientId, doctorId, currentDate]);
        const diagnosisId = diagnosisResult.insertId;

        // Insert medicines
        for (let i = 0; i < medicineName.length; i++) {
            // Retrieve patientId from diagnosis table
            const [patientResult] = await connection.execute('SELECT patient_id FROM diagnosis WHERE id = ?', [diagnosisId]);
            const patientIdFromDiagnosis = patientResult[0].patient_id;

            // Insert medicine
            await connection.execute('INSERT INTO medicine (diagnosis_id, patient_id, doctor_id, medicine_name, regime, instructions, date_time) VALUES (?, ?, ?, ?, ?, ?, ?)', [diagnosisId, patientIdFromDiagnosis, doctorId, medicineName[i], regime[i], instructions[i], currentDate]);
        }


        res.sendStatus(200); // Prescription created successfully
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
});
async function checkDoctorIdValidity(doctorId) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('SELECT id FROM doctors WHERE id = ?', [doctorId]);

        return result.length > 0; // Returns true if a doctor with the given ID exists
    } catch (error) {
        console.error('Error checking doctor ID validity:', error);
        return false; // Return false in case of an error or if the doctor ID doesn't exist
    }
}

// Endpoint to search patient history

app.get('/patient-history/:patientId', async (req, res) => {
    const patientId = req.params.patientId;
    const doctorId = req.session.user.id;

    try {
        const connection = await pool.getConnection();
        const [diagnosisRows] = await connection.execute('SELECT * FROM diagnosis WHERE patient_id = ? AND doctor_id=?', [patientId, doctorId]);

        if (diagnosisRows.length === 0) {
            res.json({ error: 'No history found for this patient' });
            return;
        }

        const history = [];

        for (const diagnosisRow of diagnosisRows) {
            const [medicineRows] = await connection.execute(`SELECT * 
            FROM medicine 
            WHERE diagnosis_id = ? 
            AND patient_id = ? 
            AND doctor_id = ?`,
                [diagnosisRow.id, patientId, doctorId]);
            history.push({
                diagnosis: diagnosisRow,
                medicines: medicineRows
            });
        }


        res.json({ history });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//monthly report
// app.post('/monthly-report', async (req, res) => {
//     const { month, year } = req.body;
//     const doctorId = req.session.user.id; // Assuming the doctor ID is stored in the session
//     // const doctorId = req.session.user.id; // Assuming the doctor ID is stored in the session

//     try {
//         // Fetch patient data along with their appointments for the given month and year
//         const monthlyReport = await fetchMonthlyReportData(doctorId, month, year);

//         if (Object.keys(monthlyReport).length === 0) {
//             res.status(404).json({ message: 'No data available for the specified month and year.' });
//         } else {
//             res.json(monthlyReport);
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while generating the report.' });
//     }
// });
app.post('/monthly-report', async (req, res) => {
    const { month, year } = req.body;
    // const doctorId = 1;
    const doctorId = req.session.user.id;

    try {
        const monthlyReport = await fetchMonthlyReportData(doctorId, month, year);

        if (Object.keys(monthlyReport).length === 0) {
            res.status(404).json({ message: 'No data available for the specified month and year.' });
        } else {
            // Calculate total bill amount for each patient
            for (const patientId in monthlyReport) {
                const appointments = monthlyReport[patientId].appointments; // Fix accessing appointments for each patient

                // Iterate over appointments array for each patient

                const totalAmount = await getTotalBillAmountForMonth(patientId, doctorId, appointments.map(appointment => appointment.date_time)); // Pass an array of date_time values
                monthlyReport[patientId].totalAmount = totalAmount;
            }

            res.json(monthlyReport);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while generating the report.' });
    }
});

async function fetchMonthlyReportData(doctorId, month, year) {
    try {
        // Fetch patient data along with their appointments for the given month and year
        const [rows] = await pool.query(
            `SELECT p.id AS patient_id, p.name AS patient_name, p.age, d.date_time, d.diagnosis, d.chief_complaints
             FROM patient p
             LEFT JOIN diagnosis d ON p.id = d.patient_id
             WHERE d.doctor_id = ?
             AND MONTH(d.date_time) = ?
             AND YEAR(d.date_time) = ?`,
            [doctorId, month, year]
        );

        const monthlyReport = {};
        rows.forEach(row => {
            const { patient_id, patient_name, age, date_time, diagnosis, chief_complaints } = row;
            if (!monthlyReport[patient_id]) {
                monthlyReport[patient_id] = {
                    name: patient_name,
                    age: age,
                    appointments: [],
                };
            }

            monthlyReport[patient_id].appointments.push({
                date_time: date_time,
                diagnosis: diagnosis,
                chief_complaints: chief_complaints
            });
        });

        return monthlyReport;
    } catch (error) {
        throw error;
    }
}

async function getTotalBillAmountForMonth(patientId, doctorId, dateTimes) {
    try {
        const [result] = await pool.query(
            `SELECT SUM(amount) AS totalAmount
             FROM bills
             WHERE patient_id = ? AND doctor_id = ? AND created_at IN (?)`, // Use IN clause to match multiple date_time values
            [patientId, doctorId, dateTimes]
        );

        return result[0].totalAmount || 0;
    } catch (error) {
        console.error('Error fetching total bill amount:', error);
        return 0;
    }
}



// Route for handling bill creation form submission
app.post('/createBill', async (req, res) => {
    const { patient_id, particulars, amounts } = req.body;
    const doctor_id = req.session.user.id;

    try {
        const connection = await pool.getConnection();
        for (let i = 0; i < particulars.length; i++) {
            await connection.execute('INSERT INTO bills (patient_id, doctor_id, particular, amount,created_at) VALUES (?, ?, ?, ?,?)', [patient_id, doctor_id, particulars[i], amounts[i], currentDate]);
        }
        res.json({ success: true }); // Sending JSON response
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' }); // Sending JSON response with error message
    }
});







// logout
// Route for handling logout requests
app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Failed to logout');
        } else {
            // Redirect the user to the login page after logout
            res.redirect('/');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
