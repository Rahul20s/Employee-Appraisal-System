// Simplified JavaScript for Integrated Dashboard
let currentUser = null;
let userRole = 'employee';

// Default KRAs
const defaultKRAs = [
    'KRA 1',
    'KRA 2',
    'KRA 3',
    'KRA 4',
    'KRA 5',
    'KRA 6',
    'KRA 7',
    'KRA 8',
    'KRA 9',
    'KRA 10'
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeAppraisal();
});

// Check authentication
async function checkAuthentication() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            currentUser = await response.json();
            displayUserInfo();
            initializeAppraisal();
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/login';
    }
}

// Display user information
function displayUserInfo() {
    if (currentUser) {
        document.getElementById('userDisplay').textContent = currentUser.displayName;
        document.getElementById('employeeName').value = currentUser.displayName;
        document.getElementById('employeeId').value = currentUser.employeeId;
        document.getElementById('department').value = currentUser.department;
        document.getElementById('designation').value = currentUser.designation;
    }
}

// Initialize appraisal form
function initializeAppraisal() {
    if (!currentUser) return;
    
    // Clear all form fields
    clearFormFields();
    
    // Determine user role based on actual user data
    if (currentUser.role === 'hr') {
        userRole = 'hr';
    } else if (currentUser.role === 'supervisor') {
        userRole = 'supervisor';
    } else {
        userRole = 'employee'; // Default fallback
    }
    
    console.log('Current user:', currentUser);
    console.log('Detected role:', userRole);
    
    // Show/hide employee selection based on role
    if (userRole === 'supervisor' || userRole === 'hr') {
        document.getElementById('employeeSelectionContainer').style.display = 'block';
        loadManagedEmployees();
        // Don't load any appraisal initially - wait for employee selection
    } else {
        document.getElementById('employeeSelectionContainer').style.display = 'none';
        // For employees, load their own appraisal if exists
        loadExistingAppraisals();
    }
    
    // Populate KRA table
    populateKRATable();
    configureFormForRole();
}

// Load managed employees for supervisor/HR
async function loadManagedEmployees() {
    try {
        const response = await fetch('/api/users/hierarchy');
        if (response.ok) {
            const data = await response.json();
            const employeeSelect = document.getElementById('employeeSelect');
            const employeeSearch = document.getElementById('employeeSearch');
            
            // Clear existing options
            employeeSelect.innerHTML = '<option value="">Choose an employee...</option>';
            
            // Get appropriate employee list based on role
            let employeesToShow = [];
            if (userRole === 'hr') {
                // HR sees all employees
                employeesToShow = data.allUsers.filter(u => u.role === 'employee');
            } else {
                // Supervisor sees only managed employees
                employeesToShow = data.managedUsers;
            }
            
            // Store all employees for search functionality
            window.allEmployees = employeesToShow;
            
            // Add employees to dropdown
            employeesToShow.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.employeeId;
                option.textContent = `${employee.displayName} (${employee.employeeId}) - ${employee.designation}`;
                employeeSelect.appendChild(option);
            });
            
            // Setup searchable dropdown functionality
            setupSearchableDropdown();
        }
    } catch (error) {
        console.error('Error loading managed employees:', error);
    }
}

// Setup searchable dropdown functionality
function setupSearchableDropdown() {
    const employeeSelect = document.getElementById('employeeSelect');
    const employeeSearch = document.getElementById('employeeSearch');
    
    // Show search box when dropdown is clicked
    employeeSelect.addEventListener('click', function() {
        employeeSearch.style.display = 'block';
        employeeSearch.focus();
    });
    
    // Handle search
    employeeSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredEmployees = window.allEmployees.filter(employee => 
            employee.displayName.toLowerCase().includes(searchTerm) ||
            employee.employeeId.toLowerCase().includes(searchTerm) ||
            employee.designation.toLowerCase().includes(searchTerm)
        );
        
        // Update dropdown with filtered results
        employeeSelect.innerHTML = '<option value="">Choose an employee...</option>';
        filteredEmployees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.employeeId;
            option.textContent = `${employee.displayName} (${employee.employeeId}) - ${employee.designation}`;
            employeeSelect.appendChild(option);
        });
        
        // Show multiple options if searching
        if (searchTerm) {
            employeeSelect.size = Math.min(filteredEmployees.length + 1, 5);
        } else {
            employeeSelect.size = 1;
        }
    });
    
    // Handle selection
    employeeSelect.addEventListener('change', function() {
        if (this.value) {
            loadEmployeeAppraisal(this.value);
            // Hide search and reset
            employeeSearch.style.display = 'none';
            employeeSearch.value = '';
            employeeSelect.size = 1;
        }
    });
    
    // Hide search when clicking outside
    document.addEventListener('click', function(e) {
        if (!employeeSearch.contains(e.target) && !employeeSelect.contains(e.target)) {
            employeeSearch.style.display = 'none';
            employeeSearch.value = '';
            employeeSelect.size = 1;
        }
    });
}

// Load specific employee's appraisal
async function loadEmployeeAppraisal(employeeId) {
    try {
        console.log('Loading appraisal for employeeId:', employeeId, 'Role:', userRole);
        const response = await fetch('/api/appraisals');
        if (response.ok) {
            const appraisals = await response.json();
            console.log('Available appraisals:', appraisals);
            
            // Find appraisal for selected employee - try both employeeId and email matching
            let employeeAppraisal = appraisals.find(a => a.employeeId === employeeId);
            
            // If not found by employeeId, try by email (fallback for existing data)
            if (!employeeAppraisal) {
                // Get employee info to get email
                const userResponse = await fetch('/api/users/hierarchy');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    
                    // Search in appropriate user list based on role
                    let employee = null;
                    if (userRole === 'hr') {
                        // HR searches in all employees
                        employee = userData.allUsers.find(u => u.role === 'employee' && u.employeeId === employeeId);
                    } else {
                        // Supervisor searches in managed employees
                        employee = userData.managedUsers.find(u => u.employeeId === employeeId);
                    }
                    
                    if (employee) {
                        employeeAppraisal = appraisals.find(a => a.employeeId === employee.email);
                        console.log('Trying email match:', employee.email, 'Found:', employeeAppraisal);
                    }
                }
            }
            
            console.log('Found appraisal:', employeeAppraisal);
            
            if (employeeAppraisal) {
                populateFormWithData(employeeAppraisal);
            } else {
                // Clear form if no appraisal exists
                clearFormFields();
                // Update employee info
                updateEmployeeInfo(employeeId);
            }
        }
    } catch (error) {
        console.error('Error loading employee appraisal:', error);
    }
}

// Update employee information in form
async function updateEmployeeInfo(employeeId) {
    try {
        console.log('Updating employee info for:', employeeId, 'Role:', userRole);
        const response = await fetch('/api/users/hierarchy');
        if (response.ok) {
            const data = await response.json();
            
            // Search in appropriate user list based on role
            let employee = null;
            if (userRole === 'hr') {
                // HR searches in all employees
                employee = data.allUsers.find(u => u.role === 'employee' && u.employeeId === employeeId);
            } else {
                // Supervisor searches in managed employees
                employee = data.managedUsers.find(u => u.employeeId === employeeId);
            }
            
            if (employee) {
                document.getElementById('employeeName').value = employee.displayName;
                document.getElementById('employeeId').value = employee.employeeId;
                document.getElementById('department').value = employee.department;
                document.getElementById('designation').value = employee.designation;
                console.log('Updated employee info for:', employee.displayName);
            }
        }
    } catch (error) {
        console.error('Error updating employee info:', error);
    }
}

// Load existing appraisals for supervisor
async function loadExistingAppraisals() {
    try {
        const response = await fetch('/api/appraisals');
        if (response.ok) {
            const appraisals = await response.json();
            console.log('Loaded appraisals:', appraisals);
            
            if (appraisals.length > 0) {
                // For employees: load only their own appraisal
                if (userRole === 'employee') {
                    const myAppraisal = appraisals.find(a => a.employeeId === currentUser.employeeId);
                    if (myAppraisal) {
                        populateFormWithData(myAppraisal);
                    }
                }
                // For supervisor/HR: wait for employee selection (don't auto-load)
            }
        }
    } catch (error) {
        console.error('Error loading appraisals:', error);
    }
}

// Populate form with existing appraisal data
function populateFormWithData(appraisal) {
    console.log('Populating form with data:', appraisal);
    
    // Populate appraisal period
    const appraisalPeriod = document.getElementById('appraisalPeriod');
    if (appraisalPeriod && appraisal.appraisalPeriod) {
        appraisalPeriod.value = appraisal.appraisalPeriod;
    }
    
    // Populate KRA data
    if (appraisal.kras && appraisal.kras.length > 0) {
        console.log('Populating KRA data:', appraisal.kras);
        appraisal.kras.forEach((kra, index) => {
            console.log(`Processing KRA ${index}:`, kra);
            
            // Populate self fields (employee data) - visible for HR and Supervisor
            const selfRating = document.getElementById(`kra-self-rating-${index}`);
            const weightage = document.getElementById(`kra-weightage-${index}`);
            const achievements = document.getElementById(`kra-achievements-${index}`);
            const challenges = document.getElementById(`kra-challenges-${index}`);
            
            if (selfRating) {
                selfRating.value = kra.selfRating || '';
                console.log(`Set self rating for KRA ${index}:`, kra.selfRating);
            }
            if (weightage) weightage.value = kra.weightage || '';
            if (achievements) achievements.value = kra.selfAchievements || '';
            if (challenges) challenges.value = kra.challenges || '';
            
            // Populate supervisor fields (manager data) - visible for HR and Supervisor
            const supervisorRating = document.getElementById(`kra-supervisor-rating-${index}`);
            const supervisorFeedback = document.getElementById(`kra-supervisor-feedback-${index}`);
            
            if (supervisorRating) supervisorRating.value = kra.supervisorRating || '';
            if (supervisorFeedback) supervisorFeedback.value = kra.supervisorFeedback || '';
        });
        
        // Calculate averages
        calculateAverages();
    }
}

// Clear all form fields
function clearFormFields() {
    // Clear KRA fields
    defaultKRAs.forEach((kra, index) => {
        // Clear self fields
        const selfRating = document.getElementById(`kra-self-rating-${index}`);
        const weightage = document.getElementById(`kra-weightage-${index}`);
        const achievements = document.getElementById(`kra-achievements-${index}`);
        const challenges = document.getElementById(`kra-challenges-${index}`);
        
        if (selfRating) selfRating.value = '';
        if (weightage) weightage.value = '';
        if (achievements) achievements.value = '';
        if (challenges) challenges.value = '';
        
        // Clear supervisor fields
        const supervisorRating = document.getElementById(`kra-supervisor-rating-${index}`);
        const supervisorFeedback = document.getElementById(`kra-supervisor-feedback-${index}`);
        
        if (supervisorRating) supervisorRating.value = '';
        if (supervisorFeedback) supervisorFeedback.value = '';
    });
    
    // Don't clear appraisal period - keep the default "2025-2026"
    // Reset averages
    document.getElementById('avgSelfRating').value = '';
    document.getElementById('avgSupervisorRating').value = '';
}

// Populate KRA table with default data
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
                    <label class="form-label small mb-1">Self Rating (1-5)</label>
                    <select class="form-select form-select-sm" id="kra-self-rating-${index}" 
                            ${userRole === 'employee' ? '' : 'disabled'}>
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
                    <input type="number" class="form-control form-control-sm" 
                           id="kra-weightage-${index}" value="" min="0" max="100" 
                           ${userRole === 'employee' ? '' : 'readonly'}>
                </div>
                <div class="mb-2">
                    <label class="form-label small mb-1">Achievements</label>
                    <textarea class="form-control form-control-sm" id="kra-achievements-${index}" 
                              rows="3" ${userRole === 'employee' ? '' : 'readonly'}></textarea>
                </div>
                <div class="mb-2">
                    <label class="form-label small mb-1">Problems Faced</label>
                    <textarea class="form-control form-control-sm" id="kra-challenges-${index}" 
                              rows="3" ${userRole === 'employee' ? '' : 'readonly'}></textarea>
                </div>
            </td>
            <td>
                <div class="mb-2">
                    <label class="form-label small mb-1">Manager Rating (1-5)</label>
                    <select class="form-select form-select-sm" id="kra-supervisor-rating-${index}" 
                            ${userRole === 'supervisor' ? '' : 'disabled'}>
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
                    <textarea class="form-control form-control-sm" id="kra-supervisor-feedback-${index}" 
                              rows="3" ${userRole === 'supervisor' ? '' : 'readonly'}></textarea>
                </div>
            </td>
        `;
        tbody.appendChild(row);

        // Add event listeners
        if (userRole === 'employee') {
            document.getElementById(`kra-self-rating-${index}`).addEventListener('change', calculateAverages);
        }
        if (userRole === 'supervisor') {
            document.getElementById(`kra-supervisor-rating-${index}`).addEventListener('change', calculateAverages);
        }
    });

    calculateAverages();
}

// Configure form based on user role
function configureFormForRole() {
    const submitBtn = document.getElementById('submitBtn');
    
    switch (userRole) {
        case 'employee':
            submitBtn.style.display = 'inline-block';
            submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Self Appraisal';
            break;
            
        case 'supervisor':
            submitBtn.style.display = 'inline-block';
            submitBtn.innerHTML = '<i class="fas fa-check me-2"></i>Submit Supervisor Review';
            break;
            
        case 'hr':
            submitBtn.style.display = 'none';
            break;
    }
}

// Calculate average ratings
function calculateAverages() {
    let selfRatings = [];
    let supervisorRatings = [];
    
    defaultKRAs.forEach((kra, index) => {
        const selfRating = document.getElementById(`kra-self-rating-${index}`).value;
        const supervisorRating = document.getElementById(`kra-supervisor-rating-${index}`).value;
        
        if (selfRating) selfRatings.push(parseInt(selfRating));
        if (supervisorRating) supervisorRatings.push(parseInt(supervisorRating));
    });
    
    const avgSelfRating = selfRatings.length > 0 
        ? (selfRatings.reduce((a, b) => a + b, 0) / selfRatings.length).toFixed(2)
        : 'N/A';
    
    const avgSupervisorRating = supervisorRatings.length > 0
        ? (supervisorRatings.reduce((a, b) => a + b, 0) / supervisorRatings.length).toFixed(2)
        : 'N/A';
    
    document.getElementById('avgSelfRating').value = avgSelfRating;
    document.getElementById('avgSupervisorRating').value = avgSupervisorRating;
}

// Submit appraisal
async function submitAppraisal() {
    try {
        const appraisalPeriod = document.getElementById('appraisalPeriod').value;
        
        // Appraisal period is now pre-filled, no validation needed
        
        // Collect KRA data
        const kras = [];
        for (let i = 0; i < defaultKRAs.length; i++) {
            const kraData = {
                parameter: defaultKRAs[i],
                selfRating: document.getElementById(`kra-self-rating-${i}`).value,
                weightage: document.getElementById(`kra-weightage-${i}`).value,
                selfAchievements: document.getElementById(`kra-achievements-${i}`).value,
                challenges: document.getElementById(`kra-challenges-${i}`).value,
                supervisorRating: document.getElementById(`kra-supervisor-rating-${i}`).value,
                supervisorFeedback: document.getElementById(`kra-supervisor-feedback-${i}`).value
            };
            kras.push(kraData);
        }
        
        // Prepare submission data
        const submissionData = {
            appraisalPeriod: appraisalPeriod,
            kras: kras
        };
        
        // Add selected employee ID for supervisor/HR submissions
        if (userRole === 'supervisor' || userRole === 'hr') {
            const selectedEmployeeId = document.getElementById('employeeSelect').value;
            if (!selectedEmployeeId) {
                alert('Please select an employee');
                return;
            }
            submissionData.selectedEmployeeId = selectedEmployeeId;
        }
        
        showLoadingModal();
        
        const response = await fetch('/api/appraisal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submissionData)
        });
        
        hideLoadingModal();
        
        if (response.ok) {
            const result = await response.json();
            console.log('Submission result:', result);
            
            if (result.success) {
                if (result.isUpdate) {
                    // Supervisor/HR submission
                    showSubmissionSuccess('Your review has been submitted successfully!');
                } else {
                    // Employee submission
                    showSubmissionSuccess('Your appraisal has been submitted successfully!');
                }
                
                // Disable form after submission
                disableForm();
            } else {
                alert('Submission failed');
            }
        } else {
            const error = await response.json();
            console.error('Error response:', error);
            alert('Error submitting appraisal: ' + error.error);
        }
    } catch (error) {
        console.error('Error submitting appraisal:', error);
        alert('Error submitting appraisal. Please try again.');
    }
}

// Disable form after submission
function disableForm() {
    // Disable all input fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.setAttribute('disabled', true);
    });
    
    // Update status
    document.getElementById('appraisalStatus').value = 'Submitted';
    
    // Change submit button text and disable
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.textContent = 'Submitted';
        submitBtn.disabled = true;
        submitBtn.classList.remove('btn-success');
        submitBtn.classList.add('btn-secondary');
    }
}

// Logout function
function logout() {
    window.location.href = '/auth/logout';
}

// Modal functions
function showLoadingModal() {
    try {
        const modalElement = document.getElementById('loadingModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    } catch (error) {
        console.error('Error showing loading modal:', error);
    }
}

function hideLoadingModal() {
    try {
        const modalElement = document.getElementById('loadingModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
    } catch (error) {
        console.error('Error hiding loading modal:', error);
    }
}

function showSuccessModal(message) {
    try {
        document.getElementById('successMessage').textContent = message;
        const modalElement = document.getElementById('successModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    } catch (error) {
        console.error('Error showing success modal:', error);
        alert(message); // Fallback to alert
    }
}

function showSubmissionSuccess() {
    const successMessage = `
        <div class="alert alert-success">
            <h5><i class="fas fa-check-circle me-2"></i>Appraisal Submitted Successfully!</h5>
            <p class="mb-2"><strong>Your appraisal has been submitted to your supervisor.</strong></p>
            <p class="mb-2">Email sent to: <strong>akash.yadav@cfmarc.in</strong></p>
            <p class="mb-0"><small>Status: <strong>Awaiting Supervisor Review</strong></small></p>
        </div>
    `;
    
    document.getElementById('successMessage').innerHTML = successMessage;
    const modalElement = document.getElementById('successModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}
