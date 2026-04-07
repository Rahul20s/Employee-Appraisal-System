const appState = {
    currentUser: null,
    userRole: 'employee',
    users: [
        { username: 'hr', password: 'password123', displayName: 'HR Manager', employeeId: 'HR001', department: 'HR', designation: 'HR Manager', role: 'hr', managedEmployees: ['EMP001','EMP002','EMP003','EMP004','EMP005','EMP006','EMP007','EMP008','EMP009','EMP010'] },
        { username: 'supervisor1', password: 'password123', displayName: 'Supervisor One', employeeId: 'SUP001', department: 'IT', designation: 'Senior Team Lead', role: 'supervisor', managedEmployees: ['EMP001','EMP002','EMP003'] },
        { username: 'supervisor2', password: 'password123', displayName: 'Supervisor Two', employeeId: 'SUP002', department: 'IT', designation: 'Team Lead', role: 'supervisor', managedEmployees: ['EMP004','EMP005','EMP006'] },
        { username: 'supervisor3', password: 'password123', displayName: 'Supervisor Three', employeeId: 'SUP003', department: 'Operations', designation: 'Operations Manager', role: 'supervisor', managedEmployees: ['EMP007','EMP008'] },
        { username: 'supervisor4', password: 'password123', displayName: 'Supervisor Four', employeeId: 'SUP004', department: 'Finance', designation: 'Finance Manager', role: 'supervisor', managedEmployees: ['EMP009','EMP010'] },
        { username: 'employee1', password: 'password123', displayName: 'Employee One', employeeId: 'EMP001', department: 'IT', designation: 'Software Developer', role: 'employee', supervisorId: 'SUP001' },
        { username: 'employee2', password: 'password123', displayName: 'Employee Two', employeeId: 'EMP002', department: 'IT', designation: 'Junior Developer', role: 'employee', supervisorId: 'SUP001' },
        { username: 'employee3', password: 'password123', displayName: 'Employee Three', employeeId: 'EMP003', department: 'IT', designation: 'QA Engineer', role: 'employee', supervisorId: 'SUP001' },
        { username: 'employee4', password: 'password123', displayName: 'Employee Four', employeeId: 'EMP004', department: 'IT', designation: 'UI/UX Designer', role: 'employee', supervisorId: 'SUP002' },
        { username: 'employee5', password: 'password123', displayName: 'Employee Five', employeeId: 'EMP005', department: 'IT', designation: 'DevOps Engineer', role: 'employee', supervisorId: 'SUP002' },
        { username: 'employee6', password: 'password123', displayName: 'Employee Six', employeeId: 'EMP006', department: 'IT', designation: 'Backend Developer', role: 'employee', supervisorId: 'SUP002' },
        { username: 'employee7', password: 'password123', displayName: 'Employee Seven', employeeId: 'EMP007', department: 'Operations', designation: 'Operations Analyst', role: 'employee', supervisorId: 'SUP003' },
        { username: 'employee8', password: 'password123', displayName: 'Employee Eight', employeeId: 'EMP008', department: 'Operations', designation: 'Operations Coordinator', role: 'employee', supervisorId: 'SUP003' },
        { username: 'employee9', password: 'password123', displayName: 'Employee Nine', employeeId: 'EMP009', department: 'Finance', designation: 'Financial Analyst', role: 'employee', supervisorId: 'SUP004' },
        { username: 'employee10', password: 'password123', displayName: 'Employee Ten', employeeId: 'EMP010', department: 'Finance', designation: 'Accountant', role: 'employee', supervisorId: 'SUP004' }
    ],
    appraisals: []
};

const defaultKRAs = ['KRA 1','KRA 2','KRA 3','KRA 4','KRA 5','KRA 6','KRA 7','KRA 8','KRA 9','KRA 10'];

function getSavedAppraisals() {
    const stored = localStorage.getItem('appraisalDemoData');
    return stored ? JSON.parse(stored) : [];
}

function saveAppraisals() {
    localStorage.setItem('appraisalDemoData', JSON.stringify(appState.appraisals));
}

function checkAuthentication() {
    const storedUser = localStorage.getItem('appraisalDemoUser');
    if (!storedUser) {
        window.location.href = 'index.html';
        return;
    }
    appState.currentUser = JSON.parse(storedUser);
    appState.userRole = appState.currentUser.role;
    appState.appraisals = getSavedAppraisals();
    displayUserInfo();
    initializeAppraisal();
}

function displayUserInfo() {
    if (!appState.currentUser) return;
    document.getElementById('userDisplay').textContent = appState.currentUser.displayName;
    document.getElementById('employeeName').value = appState.currentUser.displayName;
    document.getElementById('employeeId').value = appState.currentUser.employeeId;
    document.getElementById('department').value = appState.currentUser.department;
    document.getElementById('designation').value = appState.currentUser.designation;
}

function initializeAppraisal() {
    if (!appState.currentUser) return;
    if (appState.userRole === 'supervisor' || appState.userRole === 'hr') {
        document.getElementById('employeeSelectionContainer').style.display = 'block';
        loadManagedEmployees();
        clearFormFields();
        setStatus('Select an employee to begin');
    } else {
        document.getElementById('employeeSelectionContainer').style.display = 'none';
        loadExistingAppraisal(appState.currentUser.employeeId);
    }
    populateKRATable();
    configureFormForRole();
}

function loadManagedEmployees() {
    const employeeSelect = document.getElementById('employeeSelect');
    const employeeSearch = document.getElementById('employeeSearch');
    employeeSelect.innerHTML = '<option value="">Choose an employee...</option>';
    const employeeList = appState.users.filter(u => u.role === 'employee');
    const employeesToShow = appState.userRole === 'hr'
        ? employeeList
        : employeeList.filter(emp => (appState.currentUser.managedEmployees || []).includes(emp.employeeId));
    window.allEmployees = employeesToShow;
    employeesToShow.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.employeeId;
        option.textContent = `${employee.displayName} (${employee.employeeId}) - ${employee.designation}`;
        employeeSelect.appendChild(option);
    });
    setupSearchableDropdown();
}

function setupSearchableDropdown() {
    const employeeSelect = document.getElementById('employeeSelect');
    const employeeSearch = document.getElementById('employeeSearch');
    employeeSelect.addEventListener('click', function() {
        employeeSearch.style.display = 'block';
        employeeSearch.focus();
    });
    employeeSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filtered = window.allEmployees.filter(employee =>
            employee.displayName.toLowerCase().includes(searchTerm) ||
            employee.employeeId.toLowerCase().includes(searchTerm) ||
            employee.designation.toLowerCase().includes(searchTerm)
        );
        employeeSelect.innerHTML = '<option value="">Choose an employee...</option>';
        filtered.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.employeeId;
            option.textContent = `${employee.displayName} (${employee.employeeId}) - ${employee.designation}`;
            employeeSelect.appendChild(option);
        });
        employeeSelect.size = Math.min(filtered.length + 1, 5);
    });
    employeeSelect.addEventListener('change', function() {
        if (this.value) {
            loadExistingAppraisal(this.value);
            employeeSearch.style.display = 'none';
            employeeSearch.value = '';
            employeeSelect.size = 1;
        }
    });
    document.addEventListener('click', function(e) {
        if (!employeeSearch.contains(e.target) && !employeeSelect.contains(e.target)) {
            employeeSearch.style.display = 'none';
            employeeSearch.value = '';
            employeeSelect.size = 1;
        }
    });
}

function loadExistingAppraisal(employeeId) {
    const appraisal = appState.appraisals.find(a => a.employeeId === employeeId);
    const employee = appState.users.find(u => u.employeeId === employeeId);
    if (employee) {
        document.getElementById('employeeName').value = employee.displayName;
        document.getElementById('employeeId').value = employee.employeeId;
        document.getElementById('department').value = employee.department;
        document.getElementById('designation').value = employee.designation;
    }
    if (appraisal) {
        document.getElementById('appraisalPeriod').value = appraisal.appraisalPeriod;
        populateFormWithData(appraisal);
        setStatus(appraisal.statusText || getStatusText(appraisal.status));
        if (appraisal.submitted || appraisal.status === 'hr_approved') disableForm();
    } else {
        clearFormFields();
        setStatus('No appraisal started yet');
    }
}

function populateFormWithData(appraisal) {
    appraisal.kras.forEach((kra, index) => {
        const selfRating = document.getElementById(`kra-self-rating-${index}`);
        const weightage = document.getElementById(`kra-weightage-${index}`);
        const achievements = document.getElementById(`kra-achievements-${index}`);
        const challenges = document.getElementById(`kra-challenges-${index}`);
        const supervisorRating = document.getElementById(`kra-supervisor-rating-${index}`);
        const supervisorFeedback = document.getElementById(`kra-supervisor-feedback-${index}`);
        if (selfRating) selfRating.value = kra.selfRating || '';
        if (weightage) weightage.value = kra.weightage || '';
        if (achievements) achievements.value = kra.selfAchievements || '';
        if (challenges) challenges.value = kra.challenges || '';
        if (supervisorRating) supervisorRating.value = kra.supervisorRating || '';
        if (supervisorFeedback) supervisorFeedback.value = kra.supervisorFeedback || '';
    });
    calculateAverages();
}

function clearFormFields() {
    defaultKRAs.forEach((_, index) => {
        ['kra-self-rating-', 'kra-weightage-', 'kra-achievements-', 'kra-challenges-', 'kra-supervisor-rating-', 'kra-supervisor-feedback-'].forEach(prefix => {
            const element = document.getElementById(`${prefix}${index}`);
            if (element) element.value = '';
        });
    });
    document.getElementById('avgSelfRating').value = '';
    document.getElementById('avgSupervisorRating').value = '';
}

function populateKRATable() {
    const tbody = document.getElementById('kraTableBody');
    tbody.innerHTML = '';
    defaultKRAs.forEach((kra, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="fw-bold">${kra}</div>
                <small class="text-muted">
                    <div>Self Rating</div>
                    <div>Weightage</div>
                    <div>Achievements</div>
                    <div>Problems Faced</div>
                </small>
            </td>
            <td>
                <div class="mb-2">
                    <label class="form-label small mb-1">Self Rating</label>
                    <select class="form-select form-select-sm" id="kra-self-rating-${index}" ${appState.userRole === 'employee' ? '' : 'disabled'}>
                        <option value="">Select Rating</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label small mb-1">Weightage (%)</label>
                    <input type="number" class="form-control form-control-sm" id="kra-weightage-${index}" min="0" max="100" ${appState.userRole === 'employee' ? '' : 'readonly'}>
                </div>
                <div class="mb-2">
                    <label class="form-label small mb-1">Achievements</label>
                    <textarea class="form-control form-control-sm" id="kra-achievements-${index}" rows="3" ${appState.userRole === 'employee' ? '' : 'readonly'}></textarea>
                </div>
                <div class="mb-2">
                    <label class="form-label small mb-1">Problems Faced</label>
                    <textarea class="form-control form-control-sm" id="kra-challenges-${index}" rows="3" ${appState.userRole === 'employee' ? '' : 'readonly'}></textarea>
                </div>
            </td>
            <td>
                <div class="mb-2">
                    <label class="form-label small mb-1">Manager Rating</label>
                    <select class="form-select form-select-sm" id="kra-supervisor-rating-${index}" ${appState.userRole === 'supervisor' ? '' : 'disabled'}>
                        <option value="">Select Rating</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label small mb-1">Manager Feedback</label>
                    <textarea class="form-control form-control-sm" id="kra-supervisor-feedback-${index}" rows="3" ${appState.userRole === 'supervisor' ? '' : 'readonly'}></textarea>
                </div>
            </td>
        `;
        tbody.appendChild(row);
        const selfRating = document.getElementById(`kra-self-rating-${index}`);
        const supervisorRating = document.getElementById(`kra-supervisor-rating-${index}`);
        if (selfRating) selfRating.addEventListener('change', calculateAverages);
        if (supervisorRating) supervisorRating.addEventListener('change', calculateAverages);
    });
    calculateAverages();
}

function configureFormForRole() {
    const submitBtn = document.getElementById('submitBtn');
    if (appState.userRole === 'employee') {
        submitBtn.style.display = 'inline-block';
        submitBtn.textContent = 'Submit Self Appraisal';
        submitBtn.disabled = false;
    } else if (appState.userRole === 'supervisor') {
        submitBtn.style.display = 'inline-block';
        submitBtn.textContent = 'Submit Supervisor Review';
        submitBtn.disabled = false;
    } else if (appState.userRole === 'hr') {
        submitBtn.style.display = 'inline-block';
        submitBtn.textContent = 'Approve Appraisal';
        submitBtn.disabled = false;
    }
}

function calculateAverages() {
    const selfRatings = [];
    const supervisorRatings = [];
    defaultKRAs.forEach((_, index) => {
        const selfRating = document.getElementById(`kra-self-rating-${index}`)?.value;
        const supervisorRating = document.getElementById(`kra-supervisor-rating-${index}`)?.value;
        if (selfRating) selfRatings.push(Number(selfRating));
        if (supervisorRating) supervisorRatings.push(Number(supervisorRating));
    });
    document.getElementById('avgSelfRating').value = selfRatings.length ? (selfRatings.reduce((a,b)=>a+b,0)/selfRatings.length).toFixed(2) : 'N/A';
    document.getElementById('avgSupervisorRating').value = supervisorRatings.length ? (supervisorRatings.reduce((a,b)=>a+b,0)/supervisorRatings.length).toFixed(2) : 'N/A';
}

function submitAppraisal() {
    const selectedEmployeeId = appState.userRole === 'employee' ? appState.currentUser.employeeId : document.getElementById('employeeSelect').value;
    if (!selectedEmployeeId) {
        alert('Please select an employee before submitting.');
        return;
    }
    const employee = appState.users.find(u => u.employeeId === selectedEmployeeId);
    if (!employee) {
        alert('Unable to find employee details.');
        return;
    }
    const existing = appState.appraisals.find(a => a.employeeId === selectedEmployeeId);
    const kras = defaultKRAs.map((parameter, index) => ({
        parameter,
        selfRating: document.getElementById(`kra-self-rating-${index}`)?.value || '',
        weightage: document.getElementById(`kra-weightage-${index}`)?.value || '',
        selfAchievements: document.getElementById(`kra-achievements-${index}`)?.value || '',
        challenges: document.getElementById(`kra-challenges-${index}`)?.value || '',
        supervisorRating: document.getElementById(`kra-supervisor-rating-${index}`)?.value || '',
        supervisorFeedback: document.getElementById(`kra-supervisor-feedback-${index}`)?.value || ''
    }));
    let appraisal;
    if (appState.userRole === 'employee') {
        appraisal = {
            employeeId: employee.employeeId,
            employeeName: employee.displayName,
            department: employee.department,
            designation: employee.designation,
            appraisalPeriod: document.getElementById('appraisalPeriod').value,
            kras,
            status: 'employee_pending',
            statusText: 'Employee submitted and waiting for supervisor review',
            submitted: true,
            updatedBy: appState.currentUser.displayName,
            updatedAt: new Date().toISOString()
        };
    } else if (appState.userRole === 'supervisor') {
        if (!existing || existing.status !== 'employee_pending') {
            alert('This appraisal must be submitted by the employee first.');
            return;
        }
        appraisal = {
            ...existing,
            kras,
            status: 'supervisor_pending',
            statusText: 'Supervisor submitted and waiting for HR approval',
            submitted: true,
            updatedBy: appState.currentUser.displayName,
            updatedAt: new Date().toISOString()
        };
    } else if (appState.userRole === 'hr') {
        if (!existing || existing.status !== 'supervisor_pending') {
            alert('This appraisal must be reviewed by a supervisor before HR approval.');
            return;
        }
        appraisal = {
            ...existing,
            kras,
            status: 'hr_approved',
            statusText: 'HR has approved the appraisal',
            submitted: true,
            updatedBy: appState.currentUser.displayName,
            updatedAt: new Date().toISOString()
        };
    }
    if (!appraisal) return;
    if (existing) {
        Object.assign(existing, appraisal);
    } else {
        appState.appraisals.push(appraisal);
    }
    saveAppraisals();
    populateFormWithData(appraisal);
    setStatus(appraisal.statusText);
    disableForm();
    alert('Appraisal action saved locally in this demo.');
}

function disableForm() {
    document.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.textContent = 'Submitted';
        submitBtn.disabled = true;
        submitBtn.classList.remove('btn-success');
        submitBtn.classList.add('btn-secondary');
    }
}

function logout() {
    localStorage.removeItem('appraisalDemoUser');
    window.location.href = 'index.html';
}

function setStatus(text) {
    const status = document.getElementById('appraisalStatus');
    if (status) status.value = text;
}

function getStatusText(status) {
    switch (status) {
        case 'employee_pending': return 'Employee submitted and waiting for supervisor review';
        case 'supervisor_pending': return 'Supervisor submitted and waiting for HR approval';
        case 'hr_approved': return 'HR approved';
        default: return 'No appraisal started yet';
    }
}

window.addEventListener('DOMContentLoaded', checkAuthentication);
