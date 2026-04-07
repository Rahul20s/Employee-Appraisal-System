const appState = {
    currentUser: null,
    userRole: 'employee',
    allEmployees: [
        { displayName: 'Employee One', employeeId: 'EMP001', department: 'IT', designation: 'Software Engineer' },
        { displayName: 'Employee Two', employeeId: 'EMP002', department: 'IT', designation: 'QA Engineer' },
        { displayName: 'Employee Three', employeeId: 'EMP003', department: 'IT', designation: 'UI/UX Designer' },
        { displayName: 'Employee Four', employeeId: 'EMP004', department: 'Sales', designation: 'Sales Executive' },
        { displayName: 'Employee Five', employeeId: 'EMP005', department: 'HR', designation: 'HR Coordinator' }
    ],
    appraisals: []
};

const defaultKRAs = [
    'KRA 1', 'KRA 2', 'KRA 3', 'KRA 4', 'KRA 5', 'KRA 6', 'KRA 7', 'KRA 8', 'KRA 9', 'KRA 10'
];

const demoUsers = [
    { username: 'employee', displayName: 'Employee User', employeeId: 'EMP001', department: 'IT', designation: 'Software Engineer', role: 'employee' },
    { username: 'supervisor', displayName: 'Supervisor User', employeeId: 'SUP001', department: 'IT', designation: 'Team Lead', role: 'supervisor', managedEmployees: ['EMP001', 'EMP002', 'EMP003'] },
    { username: 'hr', displayName: 'HR Manager', employeeId: 'HR001', department: 'HR', designation: 'HR Manager', role: 'hr', managedEmployees: ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'] }
];

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
    displayUserInfo();
    initializeAppraisal();
}

function displayUserInfo() {
    if (appState.currentUser) {
        document.getElementById('userDisplay').textContent = appState.currentUser.displayName;
        document.getElementById('employeeName').value = appState.currentUser.displayName;
        document.getElementById('employeeId').value = appState.currentUser.employeeId;
        document.getElementById('department').value = appState.currentUser.department;
        document.getElementById('designation').value = appState.currentUser.designation;
    }
}

function initializeAppraisal() {
    appState.appraisals = getSavedAppraisals();
    if (!appState.currentUser) return;

    if (appState.userRole === 'supervisor' || appState.userRole === 'hr') {
        document.getElementById('employeeSelectionContainer').style.display = 'block';
        loadManagedEmployees();
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

    let employeesToShow = [];
    if (appState.userRole === 'hr') {
        employeesToShow = appState.allEmployees;
    } else {
        const manager = demoUsers.find(u => u.username === 'supervisor');
        employeesToShow = appState.allEmployees.filter(emp => manager.managedEmployees.includes(emp.employeeId));
    }
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

    employeeSelect.addEventListener('click', () => {
        employeeSearch.style.display = 'block';
        employeeSearch.focus();
    });

    employeeSearch.addEventListener('input', function () {
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

    employeeSelect.addEventListener('change', function () {
        if (this.value) {
            loadExistingAppraisal(this.value);
            employeeSearch.style.display = 'none';
            employeeSearch.value = '';
            employeeSelect.size = 1;
        }
    });

    document.addEventListener('click', function (e) {
        if (!employeeSearch.contains(e.target) && !employeeSelect.contains(e.target)) {
            employeeSearch.style.display = 'none';
            employeeSearch.value = '';
            employeeSelect.size = 1;
        }
    });
}

function loadExistingAppraisal(employeeId) {
    const appraisal = appState.appraisals.find(a => a.employeeId === employeeId);
    if (appraisal) {
        document.getElementById('employeeName').value = appraisal.employeeName;
        document.getElementById('employeeId').value = appraisal.employeeId;
        document.getElementById('department').value = appraisal.department;
        document.getElementById('designation').value = appraisal.designation;
        document.getElementById('appraisalPeriod').value = appraisal.appraisalPeriod;
        populateFormWithData(appraisal);
        if (appraisal.submitted) disableForm();
    } else if (appState.userRole !== 'employee') {
        const employee = appState.allEmployees.find(emp => emp.employeeId === employeeId);
        if (employee) {
            document.getElementById('employeeName').value = employee.displayName;
            document.getElementById('employeeId').value = employee.employeeId;
            document.getElementById('department').value = employee.department;
            document.getElementById('designation').value = employee.designation;
            clearFormFields();
        }
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
    if (!submitBtn) return;

    if (appState.userRole === 'employee') {
        submitBtn.style.display = 'inline-block';
        submitBtn.textContent = 'Submit Self Appraisal';
    } else if (appState.userRole === 'supervisor') {
        submitBtn.style.display = 'inline-block';
        submitBtn.textContent = 'Submit Supervisor Review';
    } else {
        submitBtn.style.display = 'none';
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
    document.getElementById('avgSelfRating').value = selfRatings.length ? (selfRatings.reduce((a, b) => a + b, 0) / selfRatings.length).toFixed(2) : 'N/A';
    document.getElementById('avgSupervisorRating').value = supervisorRatings.length ? (supervisorRatings.reduce((a, b) => a + b, 0) / supervisorRatings.length).toFixed(2) : 'N/A';
}

function submitAppraisal() {
    const selectedEmployeeId = appState.userRole === 'employee' ? appState.currentUser.employeeId : document.getElementById('employeeSelect').value;
    if (!selectedEmployeeId) {
        alert('Please select an employee before submitting.');
        return;
    }
    const employee = appState.userRole === 'employee'
        ? appState.currentUser
        : appState.allEmployees.find(emp => emp.employeeId === selectedEmployeeId);
    if (!employee) {
        alert('Employee data not available.');
        return;
    }
    const kras = defaultKRAs.map((parameter, index) => ({
        parameter,
        selfRating: document.getElementById(`kra-self-rating-${index}`)?.value || '',
        weightage: document.getElementById(`kra-weightage-${index}`)?.value || '',
        selfAchievements: document.getElementById(`kra-achievements-${index}`)?.value || '',
        challenges: document.getElementById(`kra-challenges-${index}`)?.value || '',
        supervisorRating: document.getElementById(`kra-supervisor-rating-${index}`)?.value || '',
        supervisorFeedback: document.getElementById(`kra-supervisor-feedback-${index}`)?.value || ''
    }));
    const appraisalRecord = {
        employeeId: employee.employeeId,
        employeeName: employee.displayName,
        department: employee.department,
        designation: employee.designation,
        appraisalPeriod: document.getElementById('appraisalPeriod').value,
        kras,
        submitted: true,
        updatedBy: appState.currentUser.displayName,
        updatedAt: new Date().toISOString()
    };

    const existingIndex = appState.appraisals.findIndex(a => a.employeeId === appraisalRecord.employeeId);
    if (existingIndex >= 0) {
        appState.appraisals[existingIndex] = appraisalRecord;
    } else {
        appState.appraisals.push(appraisalRecord);
    }
    saveAppraisals();
    disableForm();
    alert('Appraisal has been saved locally in your browser.');
}

function disableForm() {
    document.querySelectorAll('input, textarea, select').forEach(control => {
        control.disabled = true;
    });
    document.getElementById('appraisalStatus').value = 'Submitted';
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

window.addEventListener('DOMContentLoaded', checkAuthentication);
