# Hospital Management System

Full-stack HMS built with React + Spring Boot + PostgreSQL.

## Prerequisites
- Java 21 (download from https://adoptium.net)
- Node.js 18+ (download from https://nodejs.org)
- PostgreSQL 15+ (download from https://postgresql.org)
- Maven 3.9+ (bundled with Spring Boot or install separately)

---

## Step 1 — Create PostgreSQL Database

Open pgAdmin or psql and run:
```sql
CREATE DATABASE hospital_db;
```

---

## Step 2 — Configure Backend

Open `hospital-backend/src/main/resources/application.yml`

Change these to your PostgreSQL credentials:
```yaml
spring:
  datasource:
    username: postgres      # your DB username
    password: postgres      # your DB password
```

---

## Step 3 — Start the Backend

```bash
cd hospital-backend
mvn spring-boot:run
```

The backend starts at: http://localhost:8080

Swagger UI: http://localhost:8080/swagger-ui.html

On first startup, a default admin account is created:
- Username: admin
- Password: Admin@123

---

## Step 4 — Start the Frontend

```bash
cd hospital-frontend
npm install
npm start
```

The frontend starts at: http://localhost:3000

---

## Project Structure

```
Hospital Project/
├── hospital-backend/           # Spring Boot application
│   └── src/main/java/com/hospital/hms/
│       ├── config/             # Security, Swagger, App config beans
│       ├── controller/         # REST API endpoints
│       ├── dto/                # Request/Response data classes
│       │   ├── request/        # What frontend sends (validated)
│       │   └── response/       # What backend sends back
│       ├── entity/             # JPA entities = database tables
│       ├── exception/          # Custom exceptions + global handler
│       ├── repository/         # Database queries (Spring Data JPA)
│       ├── security/           # JWT filter, UserDetailsService
│       └── service/            # Business logic
│
└── hospital-frontend/          # React application
    └── src/
        ├── api/                # Axios API calls (one file per module)
        ├── components/         # React UI components
        │   ├── admin/          # Admin dashboard
        │   ├── appointment/    # Appointment management
        │   ├── attendance/     # Attendance management
        │   ├── auth/           # Login page
        │   ├── common/         # ProtectedRoute, shared components
        │   ├── layout/         # Sidebar, TopNavbar, MainLayout
        │   ├── patient/        # Patient management
        │   ├── payroll/        # Payroll + payslip download
        │   ├── queue/          # Queue management
        │   └── support/        # Support tickets
        ├── context/            # AuthContext (global auth state)
        ├── styles/             # Global CSS
        └── App.js              # Route definitions
```

---

## Modules

| Module | Backend Endpoint | Frontend Route |
|--------|-----------------|----------------|
| Admin Dashboard | GET /api/admin/dashboard | /admin/dashboard |
| Staff Management | /api/staff | /staff |
| Attendance | /api/attendance | /attendance |
| Payroll + PDF | /api/payroll | /payroll |
| Patient Management | /api/patients | /patients |
| Appointment | /api/appointments | /appointments |
| Queue | /api/queue | /queue |
| Support Tickets | /api/tickets | /tickets |

---

## API Authentication

All APIs (except /api/auth/**) require a JWT token.

1. POST /api/auth/login with `{ usernameOrEmail, password }`
2. Copy the `token` from the response
3. Add header to every request: `Authorization: Bearer <token>`

In Swagger UI: click the "Authorize" button (🔒) and paste your token.

---

## Default Roles

| Role | Access |
|------|--------|
| ROLE_ADMIN | Full access |
| ROLE_DOCTOR | Patients, Appointments, Queue |
| ROLE_NURSE | Attendance, Patients, Queue |
| ROLE_RECEPTIONIST | Appointments, Queue, Patients |
| ROLE_HR | Staff, Attendance, Payroll |
| ROLE_ACCOUNTANT | Payroll |
