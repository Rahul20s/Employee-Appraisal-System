# Employee Appraisal System

A comprehensive web-based employee appraisal system with role-based access control and organizational hierarchy management.

## Features

- **Role-Based Access Control**: Employee, Supervisor, and HR roles with specific permissions
- **Organizational Hierarchy**: 1 HR, 4 Supervisors, 10 Employees with defined reporting structure
- **Searchable Employee Selection**: Real-time search for supervisors and HR to find employees
- **Form Locking**: Forms become read-only after submission
- **Data Isolation**: Each employee can only see their own appraisal data
- **Complete Workflow**: Employee submission → Supervisor review → HR final approval

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run the server**:
   ```bash
   node server.js
   ```

4. **Access the application**:
   Open http://localhost:3000 in your browser

## Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Employee | employee | password123 |
| Supervisor | supervisor | password123 |
| HR | hr | password123 |

## Organizational Structure

### HR Department
- **HR Manager** (`hr@cfmarc.in`) - Manages all employees

### Supervisors & Teams
- **Supervisor One** (`supervisor1@cfmarc.in`) - Manages Employee One, Two, Three
- **Supervisor Two** (`supervisor2@cfmarc.in`) - Manages Employee Four, Five, Six  
- **Supervisor Three** (`supervisor3@cfmarc.in`) - Manages Employee Seven, Eight
- **Supervisor Four** (`supervisor4@cfmarc.in`) - Manages Employee Nine, Ten

## Workflow

1. **Employee**: Fills self-appraisal form and submits to supervisor
2. **Supervisor**: Reviews employee submission, adds ratings/feedback, submits to HR
3. **HR**: Reviews complete appraisal, can approve or request changes

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Authentication**: Session-based with dummy authentication (development)
- **Data Storage**: In-memory storage (development mode)

## File Structure

```
Form/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── public/
│   ├── index.html         # Main appraisal form
│   ├── login.html         # Login page
│   ├── appraisal.js       # Frontend JavaScript
│   └── styles.css         # Custom styles
└── ORGANIZATION_STRUCTURE.md  # Detailed user hierarchy
```

## Development Notes

- Uses in-memory storage for development (no database required)
- Dummy authentication system for testing
- Default appraisal period: "2025-2026"
- Email notifications configured for Gmail SMTP (optional)

## Production Deployment

For production deployment:
1. Set up MongoDB database
2. Configure Azure AD authentication
3. Update environment variables
4. Deploy with PM2 or similar process manager

## Support

For issues and questions, refer to the `ORGANIZATION_STRUCTURE.md` file for detailed user hierarchy and login information.
