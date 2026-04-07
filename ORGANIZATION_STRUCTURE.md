ru# Employee Appraisal System - Organization Structure

## 📋 User Hierarchy Overview

### **HR Department**
- **HR Manager** (`hr@cfmarc.in`)
  - Manages: All 10 employees across all departments
  - Can view all employee appraisals
  - Final approval authority

### **IT Department**
- **Supervisor One** (`supervisor1@cfmarc.in`)
  - **Manages 3 Employees:**
    - Employee One (`employee1@cfmarc.in`) - Software Developer
    - Employee Two (`employee2@cfmarc.in`) - Junior Developer  
    - Employee Three (`employee3@cfmarc.in`) - QA Engineer

- **Supervisor Two** (`supervisor2@cfmarc.in`)
  - **Manages 3 Employees:**
    - Employee Four (`employee4@cfmarc.in`) - UI/UX Designer
    - Employee Five (`employee5@cfmarc.in`) - DevOps Engineer
    - Employee Six (`employee6@cfmarc.in`) - Backend Developer

### **Operations Department**
- **Supervisor Three** (`supervisor3@cfmarc.in`)
  - **Manages 2 Employees:**
    - Employee Seven (`employee7@cfmarc.in`) - Operations Analyst
    - Employee Eight (`employee8@cfmarc.in`) - Operations Coordinator

### **Finance Department**
- **Supervisor Four** (`supervisor4@cfmarc.in`)
  - **Manages 2 Employees:**
    - Employee Nine (`employee9@cfmarc.in`) - Financial Analyst
    - Employee Ten (`employee10@cfmarc.in`) - Accountant

---

## 🔐 Login Credentials

### **HR (1 User)**
- **Username:** `hr`
- **Password:** `password123`
- **Email:** `hr@cfmarc.in`
- **Access:** Can view all 10 employees

### **Supervisors (4 Users)**
- **Supervisor One:** `supervisor1` / `password123` (Manages EMP001-003)
- **Supervisor Two:** `supervisor2` / `password123` (Manages EMP004-006)
- **Supervisor Three:** `supervisor3` / `password123` (Manages EMP007-008)
- **Supervisor Four:** `supervisor4` / `password123` (Manages EMP009-010)

### **Employees (10 Users)**
- **Employee One:** `employee1` / `password123` (Reports to Supervisor One)
- **Employee Two:** `employee2` / `password123` (Reports to Supervisor One)
- **Employee Three:** `employee3` / `password123` (Reports to Supervisor One)
- **Employee Four:** `employee4` / `password123` (Reports to Supervisor Two)
- **Employee Five:** `employee5` / `password123` (Reports to Supervisor Two)
- **Employee Six:** `employee6` / `password123` (Reports to Supervisor Two)
- **Employee Seven:** `employee7` / `password123` (Reports to Supervisor Three)
- **Employee Eight:** `employee8` / `password123` (Reports to Supervisor Three)
- **Employee Nine:** `employee9` / `password123` (Reports to Supervisor Four)
- **Employee Ten:** `employee10` / `password123` (Reports to Supervisor Four)

---

## 🔄 Workflow Process

### **1. Employee Self-Appraisal**
- Employee logs in with their credentials
- Fills out KRA form (self-rating, achievements, challenges)
- Submits appraisal → Email sent to their supervisor

### **2. Supervisor Review**
- Supervisor logs in → Sees dropdown with their managed employees
- Selects employee → Views employee's submitted data
- Adds supervisor ratings and feedback
- Submits → Email sent to HR

### **3. HR Final Review**
- HR logs in → Sees dropdown with all employees
- Selects any employee → Views complete appraisal data
- Can approve or request changes

---

## 🎯 Key Features

### **Role-Based Access Control**
- **Employee:** Can only edit their own appraisal
- **Supervisor:** Can only view/edit their managed employees
- **HR:** Can view all employees (read-only)

### **Employee Selection Dropdown**
- **Supervisor:** Shows only their 2-3 managed employees
- **HR:** Shows all 10 employees
- **Employee:** Dropdown hidden (only sees their own form)

### **Email Notifications**
- Employee → Supervisor: New appraisal submission
- Supervisor → HR: Completed appraisal review

---

## 📊 Testing Scenarios

### **Test Supervisor One's Team**
1. Login as `employee1`, `employee2`, or `employee3` → Submit appraisals
2. Login as `supervisor1` → Should see only these 3 employees in dropdown
3. Select each employee → Review and submit

### **Test HR Full Access**
1. Multiple employees submit appraisals
2. Login as `hr` → Should see all 10 employees in dropdown
3. Select any employee → View complete appraisal data

### **Test Supervisor Isolation**
1. Login as `supervisor2` → Should NOT see employees 1, 2, 3
2. Login as `supervisor3` → Should NOT see IT department employees
3. Verify each supervisor sees only their assigned team

---

## 🔧 Azure AD Integration (Future)

This structure is designed to easily integrate with Azure AD:
- **User roles** mapped to Azure AD groups
- **Manager relationships** from Azure AD organizational hierarchy
- **Email addresses** from Azure AD user profiles
- **Authentication** via Azure AD SSO

The current dummy authentication system mirrors this structure for development testing.
