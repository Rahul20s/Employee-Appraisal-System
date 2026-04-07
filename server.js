const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'development-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 } // 1 hour
}));

// MongoDB Connection (with error handling)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appraisal_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => {
    console.log('MongoDB connection failed, running without database:', err.message);
});

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    displayName: String,
    employeeId: String,
    department: String,
    designation: String,
    email: String,
    supervisorEmail: String,
    role: String
});

const User = mongoose.model('User', userSchema);

// Appraisal Schema
const appraisalSchema = new mongoose.Schema({
    employeeId: String,
    employeeName: String,
    department: String,
    designation: String,
    appraisalPeriod: String,
    status: { type: String, default: 'employee_pending' },
    kras: [{
        parameter: String,
        weightage: Number,
        challenges: String,
        selfRating: Number,
        selfAchievements: String,
        supervisorRating: Number,
        supervisorFeedback: String
    }],
    employeeSubmittedAt: Date,
    supervisorSubmittedAt: Date,
    hrReceivedAt: Date
});

const Appraisal = mongoose.model('Appraisal', appraisalSchema);

// Email Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// In-memory user data (fallback when MongoDB is not available)
const inMemoryUsers = [
    // HR - 1 user
    {
        username: 'hr',
        password: 'password123',
        displayName: 'HR Manager',
        employeeId: 'HR001',
        department: 'HR',
        designation: 'HR Manager',
        email: 'hr@cfmarc.in',
        supervisorEmail: '',
        role: 'hr',
        managedEmployees: ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010']
    },
    
    // Supervisors - 4 users
    {
        username: 'supervisor1',
        password: 'password123',
        displayName: 'Supervisor One',
        employeeId: 'SUP001',
        department: 'IT',
        designation: 'Senior Team Lead',
        email: 'supervisor1@cfmarc.in',
        supervisorEmail: 'hr@cfmarc.in',
        role: 'supervisor',
        managedEmployees: ['EMP001', 'EMP002', 'EMP003']
    },
    {
        username: 'supervisor2',
        password: 'password123',
        displayName: 'Supervisor Two',
        employeeId: 'SUP002',
        department: 'IT',
        designation: 'Team Lead',
        email: 'supervisor2@cfmarc.in',
        supervisorEmail: 'hr@cfmarc.in',
        role: 'supervisor',
        managedEmployees: ['EMP004', 'EMP005', 'EMP006']
    },
    {
        username: 'supervisor3',
        password: 'password123',
        displayName: 'Supervisor Three',
        employeeId: 'SUP003',
        department: 'Operations',
        designation: 'Operations Manager',
        email: 'supervisor3@cfmarc.in',
        supervisorEmail: 'hr@cfmarc.in',
        role: 'supervisor',
        managedEmployees: ['EMP007', 'EMP008']
    },
    {
        username: 'supervisor4',
        password: 'password123',
        displayName: 'Supervisor Four',
        employeeId: 'SUP004',
        department: 'Finance',
        designation: 'Finance Manager',
        email: 'supervisor4@cfmarc.in',
        supervisorEmail: 'hr@cfmarc.in',
        role: 'supervisor',
        managedEmployees: ['EMP009', 'EMP010']
    },
    
    // Employees - 10 users
    {
        username: 'employee1',
        password: 'password123',
        displayName: 'Employee One',
        employeeId: 'EMP001',
        department: 'IT',
        designation: 'Software Developer',
        email: 'employee1@cfmarc.in',
        supervisorEmail: 'supervisor1@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP001'
    },
    {
        username: 'employee2',
        password: 'password123',
        displayName: 'Employee Two',
        employeeId: 'EMP002',
        department: 'IT',
        designation: 'Junior Developer',
        email: 'employee2@cfmarc.in',
        supervisorEmail: 'supervisor1@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP001'
    },
    {
        username: 'employee3',
        password: 'password123',
        displayName: 'Employee Three',
        employeeId: 'EMP003',
        department: 'IT',
        designation: 'QA Engineer',
        email: 'employee3@cfmarc.in',
        supervisorEmail: 'supervisor1@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP001'
    },
    {
        username: 'employee4',
        password: 'password123',
        displayName: 'Employee Four',
        employeeId: 'EMP004',
        department: 'IT',
        designation: 'UI/UX Designer',
        email: 'employee4@cfmarc.in',
        supervisorEmail: 'supervisor2@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP002'
    },
    {
        username: 'employee5',
        password: 'password123',
        displayName: 'Employee Five',
        employeeId: 'EMP005',
        department: 'IT',
        designation: 'DevOps Engineer',
        email: 'employee5@cfmarc.in',
        supervisorEmail: 'supervisor2@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP002'
    },
    {
        username: 'employee6',
        password: 'password123',
        displayName: 'Employee Six',
        employeeId: 'EMP006',
        department: 'IT',
        designation: 'Backend Developer',
        email: 'employee6@cfmarc.in',
        supervisorEmail: 'supervisor2@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP002'
    },
    {
        username: 'employee7',
        password: 'password123',
        displayName: 'Employee Seven',
        employeeId: 'EMP007',
        department: 'Operations',
        designation: 'Operations Analyst',
        email: 'employee7@cfmarc.in',
        supervisorEmail: 'supervisor3@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP003'
    },
    {
        username: 'employee8',
        password: 'password123',
        displayName: 'Employee Eight',
        employeeId: 'EMP008',
        department: 'Operations',
        designation: 'Operations Coordinator',
        email: 'employee8@cfmarc.in',
        supervisorEmail: 'supervisor3@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP003'
    },
    {
        username: 'employee9',
        password: 'password123',
        displayName: 'Employee Nine',
        employeeId: 'EMP009',
        department: 'Finance',
        designation: 'Financial Analyst',
        email: 'employee9@cfmarc.in',
        supervisorEmail: 'supervisor4@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP004'
    },
    {
        username: 'employee10',
        password: 'password123',
        displayName: 'Employee Ten',
        employeeId: 'EMP010',
        department: 'Finance',
        designation: 'Accountant',
        email: 'employee10@cfmarc.in',
        supervisorEmail: 'supervisor4@cfmarc.in',
        role: 'employee',
        supervisorId: 'SUP004'
    }
];

// In-memory appraisal storage
const inMemoryAppraisals = [];
async function createDummyUsers() {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB not connected, using in-memory user data');
            return;
        }
        
        const users = [
            {
                username: 'employee',
                password: 'password123',
                displayName: 'John Doe',
                employeeId: 'EMP001',
                department: 'IT',
                designation: 'Software Developer',
                email: 'john.doe@company.com',
                supervisorEmail: 'jane.smith@company.com',
                role: 'employee'
            },
            {
                username: 'supervisor',
                password: 'password123',
                displayName: 'Jane Smith',
                employeeId: 'SUP001',
                department: 'IT',
                designation: 'Team Lead',
                email: 'jane.smith@company.com',
                supervisorEmail: 'hr@company.com',
                role: 'supervisor'
            },
            {
                username: 'hr',
                password: 'password123',
                displayName: 'HR Manager',
                employeeId: 'HR001',
                department: 'HR',
                designation: 'HR Manager',
                email: 'hr@company.com',
                supervisorEmail: '',
                role: 'hr'
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({ username: userData.username });
            if (!existingUser) {
                await User.create(userData);
                console.log(`Created dummy user: ${userData.username}`);
            }
        }
    } catch (error) {
        console.error('Error creating dummy users:', error);
    }
}

// Authentication Routes
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/auth/login', (req, res) => {
    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    console.log('Login attempt received');
    console.log('Request body:', req.body);
    
    const { username, password } = req.body;
    
    try {
        let user = null;
        
        console.log('Looking for user:', username, password);
        
        // Try MongoDB first
        if (mongoose.connection.readyState === 1) {
            user = await User.findOne({ username, password });
        } else {
            // Fallback to in-memory data
            user = inMemoryUsers.find(u => u.username === username && u.password === password);
        }
        
        console.log('Found user:', user);
        
        if (user) {
            req.session.user = user;
            console.log('Login successful, redirecting to /');
            res.redirect('/');
        } else {
            console.log('Login failed');
            res.redirect('/login?error=1');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login?error=1');
    }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// API Routes
app.get('/api/user', isAuthenticated, (req, res) => {
    res.json(req.session.user);
});

app.get('/api/appraisal/:id', isAuthenticated, async (req, res) => {
    try {
        const appraisal = await Appraisal.findById(req.params.id);
        if (!appraisal) {
            return res.status(404).json({ error: 'Appraisal not found' });
        }
        
        // Check if user has permission to view this appraisal
        const user = req.session.user;
        if (user.email !== appraisal.employeeId && 
            user.email !== appraisal.supervisorEmail && 
            user.role !== 'hr') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        res.json(appraisal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user hierarchy information
app.get('/api/users/hierarchy', isAuthenticated, async (req, res) => {
    try {
        const currentUser = req.session.user;
        let users = [];
        
        // Try MongoDB first
        if (mongoose.connection.readyState === 1) {
            users = await User.find().sort({ role: 1, displayName: 1 });
        } else {
            // Fallback to in-memory storage
            users = inMemoryUsers;
        }
        
        // Filter based on user role
        let managedUsers = [];
        
        if (currentUser.role === 'hr') {
            // HR can see all employees
            managedUsers = users.filter(u => u.role === 'employee');
        } else if (currentUser.role === 'supervisor') {
            // Supervisor can see only their managed employees
            const managedEmployeeIds = currentUser.managedEmployees || [];
            managedUsers = users.filter(u => 
                u.role === 'employee' && 
                managedEmployeeIds.includes(u.employeeId)
            );
        }
        
        res.json({
            currentUser: currentUser,
            managedUsers: managedUsers,
            allUsers: users
        });
    } catch (error) {
        console.error('Error fetching user hierarchy:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all appraisals
app.get('/api/appraisals', isAuthenticated, async (req, res) => {
    try {
        let appraisals = [];
        
        // Try MongoDB first
        if (mongoose.connection.readyState === 1) {
            appraisals = await Appraisal.find().sort({ createdAt: -1 });
        } else {
            // Fallback to in-memory storage
            appraisals = inMemoryAppraisals;
        }
        
        res.json(appraisals);
    } catch (error) {
        console.error('Error fetching appraisals:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/appraisal', isAuthenticated, async (req, res) => {
    try {
        const user = req.session.user;
        const { appraisalPeriod, kras, selectedEmployeeId } = req.body;
        
        let appraisal;
        let isUpdate = false;
        
        // Determine if this is an employee or supervisor submission
        if (user.role === 'employee') {
            // Employee submission - create new appraisal
            appraisal = {
                _id: Date.now().toString(),
                employeeId: user.email,
                employeeName: user.displayName,
                department: user.department,
                designation: user.designation,
                appraisalPeriod: appraisalPeriod,
                status: 'supervisor_pending',
                kras: kras,
                employeeSubmittedAt: new Date()
            };
        } else if (user.role === 'supervisor' || user.role === 'hr') {
            // Supervisor/HR submission - update existing appraisal
            let existingAppraisals = [];
            
            if (mongoose.connection.readyState === 1) {
                existingAppraisals = await Appraisal.find();
            } else {
                existingAppraisals = inMemoryAppraisals;
            }
            
            // Find existing appraisal for the selected employee
            const existingAppraisal = existingAppraisals.find(a => {
                // Try matching by employee email first
                if (selectedEmployeeId) {
                    const targetEmployee = inMemoryUsers.find(u => u.employeeId === selectedEmployeeId);
                    return a.employeeId === (targetEmployee ? targetEmployee.email : selectedEmployeeId);
                }
                return false;
            });
            
            if (existingAppraisal) {
                // Update existing appraisal with supervisor data
                existingAppraisal.kras = kras;
                existingAppraisal.status = 'hr_review';
                existingAppraisal.supervisorSubmittedAt = new Date();
                existingAppraisal.supervisorName = user.displayName;
                appraisal = existingAppraisal;
                isUpdate = true;
                
                console.log('Updated existing appraisal for:', existingAppraisal.employeeId);
            } else {
                return res.status(404).json({ error: 'No appraisal found for this employee' });
            }
        }
        
        // Save to database or memory
        if (mongoose.connection.readyState === 1) {
            if (isUpdate) {
                await Appraisal.findByIdAndUpdate(appraisal._id, appraisal);
            } else {
                const newAppraisal = new Appraisal(appraisal);
                await newAppraisal.save();
            }
        } else {
            if (isUpdate) {
                // Update in memory
                const index = inMemoryAppraisals.findIndex(a => a._id === appraisal._id);
                if (index !== -1) {
                    inMemoryAppraisals[index] = appraisal;
                }
            } else {
                // Add to memory
                inMemoryAppraisals.push(appraisal);
            }
        }
        
        // Send email notification
        let recipientEmail = '';
        let emailSubject = '';
        let emailBody = '';
        
        if (user.role === 'employee') {
            // Employee submission -> notify supervisor
            recipientEmail = user.supervisorEmail;
            emailSubject = `Employee Appraisal Review - ${user.displayName}`;
            emailBody = `
                <h2>Employee Appraisal Review</h2>
                <p>Dear Supervisor,</p>
                <p>${user.displayName} has submitted their self-appraisal for review.</p>
                <p>Please click the link below to access the appraisal form:</p>
                <a href="http://localhost:3000">Review Appraisal</a>
                <p>Best regards,<br>HR System</p>
            `;
        } else if (user.role === 'supervisor') {
            // Supervisor submission -> notify HR
            recipientEmail = 'hr@cfmarc.in';
            emailSubject = `Appraisal Completed - ${appraisal.employeeName}`;
            emailBody = `
                <h2>Appraisal Completed</h2>
                <p>Dear HR,</p>
                <p>${user.displayName} has completed the appraisal review for ${appraisal.employeeName}.</p>
                <p>Please click the link below to access the appraisal form:</p>
                <a href="http://localhost:3000">View Appraisal</a>
                <p>Best regards,<br>Appraisal System</p>
            `;
        }
        
        if (recipientEmail) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipientEmail,
                subject: emailSubject,
                html: emailBody
            };
            
            try {
                await transporter.sendMail(mailOptions);
                console.log('Email sent to:', recipientEmail);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        }
        
        res.json({ success: true, appraisalId: appraisal._id, isUpdate: isUpdate });
    } catch (error) {
        console.error('Error saving appraisal:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/appraisal/:id', isAuthenticated, async (req, res) => {
    try {
        const appraisal = await Appraisal.findById(req.params.id);
        if (!appraisal) {
            return res.status(404).json({ error: 'Appraisal not found' });
        }
        
        const user = req.session.user;
        
        // Check permissions
        if (user.email === appraisal.employeeId && appraisal.status === 'employee_pending') {
            // Employee updating their self-appraisal
            appraisal.kras = req.body.kras;
            appraisal.status = 'supervisor_pending';
            appraisal.employeeSubmittedAt = new Date();
        } else if (user.email === appraisal.supervisorEmail && appraisal.status === 'supervisor_pending') {
            // Supervisor updating their evaluation
            appraisal.kras = req.body.kras;
            appraisal.status = 'hr_review';
            appraisal.supervisorSubmittedAt = new Date();
            
            // Send email to HR
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.HR_EMAIL,
                subject: `Completed Appraisal - ${appraisal.employeeName}`,
                html: `
                    <h2>Completed Appraisal</h2>
                    <p>Dear HR Team,</p>
                    <p>The appraisal for ${appraisal.employeeName} has been completed by both employee and supervisor.</p>
                    <p>Please click the link below to access the appraisal form:</p>
                    <a href="http://localhost:3000/appraisal/${appraisal._id}">View Appraisal</a>
                    <p>Best regards,<br>HR System</p>
                `
            };
            
            try {
                await transporter.sendMail(mailOptions);
                console.log('Email sent to HR:', process.env.HR_EMAIL);
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        } else {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        await appraisal.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main HTML file
app.get('/', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/index-simple.html');
});

app.get('/appraisal/:id', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/appraisal.html');
});

// Start server and create dummy users
app.listen(PORT, async () => {
    console.log(`Development server running on port ${PORT}`);
    console.log('Login credentials:');
    console.log('Employee: username: employee, password: password123');
    console.log('Supervisor: username: supervisor, password: password123');
    console.log('HR: username: hr, password: password123');
    await createDummyUsers();
});
