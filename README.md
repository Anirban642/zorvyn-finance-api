# Finance Data Processing and Access Control Backend

A comprehensive backend system for managing financial records with role-based access control, built for the Zorvyn Backend Developer Internship assignment.

## 🎯 Assignment Submission

**Submitted by:** Anirban Das  
**Email:** anirbandas64237@gmail.com  
**Position:** Backend Developer Intern  
**Company:** Zorvyn FinTech Pvt. Ltd.  
**Submission Date:** April 3, 2026  

---

## 🌐 Live Deployment

**🚀 Production API**: https://finance-backend-jj4v.onrender.com

**📡 API Status**: 
```bash
curl https://finance-backend-jj4v.onrender.com/health
```

**📚 API Documentation**:
```bash
curl https://finance-backend-jj4v.onrender.com/api
```

### Quick Test

**Login (Admin):**
```bash
curl -X POST https://finance-backend-jj4v.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.com","password":"admin123"}'
```

**Get Dashboard (requires token from login):**
```bash
curl -X GET https://finance-backend-jj4v.onrender.com/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 🔑 Test Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@finance.com | admin123 | Full access - manage all users and records |
| Analyst | analyst@finance.com | analyst123 | View all records, create/update own records, access insights |
| Viewer | viewer@finance.com | viewer123 | View own records and dashboard summaries only |

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Role Management**: Three user roles (Admin, Analyst, Viewer) with different permission levels
- **Financial Records Management**: Complete CRUD operations for financial transactions
- **Dashboard Analytics**: Comprehensive financial insights and reporting
- **Access Control**: Row-level security based on user roles
- **Data Filtering**: Advanced filtering by date, category, amount, and type
- **Trend Analysis**: Monthly and weekly financial trends
- **Category Insights**: Breakdown of income and expenses by category

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Design Decisions](#design-decisions)

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

## ✅ Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd finance-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

## 🗄 Database Setup

1. **Create PostgreSQL database**
```bash
psql -U postgres
CREATE DATABASE finance_db;
\q
```

2. **Initialize database schema**
```bash
npm run db:init
```

3. **Seed database with test data**
```bash
npm run db:seed
```

Or run both together:
```bash
npm run db:setup
```

## 🔑 Default Test Accounts

After seeding, you'll have these test accounts:

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@finance.com | admin123 | Admin | Full access - manage users, records, view all data |
| analyst@finance.com | analyst123 | Analyst | View all records, create/update own records, access insights |
| viewer@finance.com | viewer123 | Viewer | View own records and dashboard summaries only |

## 🚀 Running the Application

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@finance.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@finance.com",
      "full_name": "Admin User",
      "role": "admin"
    }
  }
}
```

#### 2. Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### 3. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### User Management Endpoints (Admin Only)

#### 1. Register New User
```http
POST /api/users/register
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User",
  "role": "viewer"
}
```

#### 2. Get All Users
```http
GET /api/users
Authorization: Bearer <admin-token>
```

#### 3. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

#### 4. Update User
```http
PUT /api/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "role": "analyst",
  "is_active": true
}
```

#### 5. Deactivate User
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

#### 6. Get All Roles
```http
GET /api/users/roles/all
Authorization: Bearer <token>
```

### Financial Records Endpoints

#### 1. Create Record (Admin, Analyst)
```http
POST /api/records
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500.50,
  "type": "expense",
  "category": "Rent",
  "date": "2026-04-01",
  "description": "Monthly rent payment",
  "notes": "Additional notes"
}
```

**Field Constraints:**
- `amount`: Required, positive number
- `type`: Required, either "income" or "expense"
- `category`: Required, string
- `date`: Optional, format YYYY-MM-DD (defaults to today)
- `description`: Optional, string
- `notes`: Optional, string

#### 2. Get All Records
```http
GET /api/records
Authorization: Bearer <token>

Query Parameters:
- type: income | expense
- category: string
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
- minAmount: number
- maxAmount: number
- limit: number
- offset: number
```

**Example:**
```http
GET /api/records?type=expense&startDate=2026-03-01&endDate=2026-03-31&limit=10
```

#### 3. Get Record by ID
```http
GET /api/records/:id
Authorization: Bearer <token>
```

#### 4. Update Record (Admin, Analyst)
```http
PUT /api/records/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1600.00,
  "description": "Updated description"
}
```

#### 5. Delete Record (Admin Only)
```http
DELETE /api/records/:id
Authorization: Bearer <admin-token>
```

#### 6. Get Recent Records
```http
GET /api/records/recent?limit=10
Authorization: Bearer <token>
```

#### 7. Get Categories
```http
GET /api/records/categories
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### 1. Get Complete Dashboard
```http
GET /api/dashboard
Authorization: Bearer <token>

Query Parameters:
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

**Response includes:**
- Summary (total income, expense, balance)
- Monthly trends (last 6 months)
- Top expense categories
- Top income categories
- Month-to-month comparison

#### 2. Get Summary
```http
GET /api/dashboard/summary
Authorization: Bearer <token>

Query Parameters:
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

**Response:**
```json
{
  "success": true,
  "message": "Summary retrieved successfully",
  "data": {
    "summary": {
      "total_income": 5000.00,
      "total_expense": 2000.00,
      "net_balance": 3000.00,
      "total_transactions": 15,
      "income_count": 5,
      "expense_count": 10
    }
  }
}
```

#### 3. Get Category Breakdown
```http
GET /api/dashboard/categories
Authorization: Bearer <token>

Query Parameters:
- type: income | expense
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

#### 4. Get Monthly Trends
```http
GET /api/dashboard/trends/monthly?months=6
Authorization: Bearer <token>
```

#### 5. Get Weekly Trends
```http
GET /api/dashboard/trends/weekly?weeks=4
Authorization: Bearer <token>
```

#### 6. Get Top Categories
```http
GET /api/dashboard/top-categories?type=expense&limit=5
Authorization: Bearer <token>

Query Parameters:
- type: income | expense (default: expense)
- limit: number (1-20, default: 5)
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

#### 7. Get Insights (Admin, Analyst)
```http
GET /api/dashboard/insights
Authorization: Bearer <token>

Query Parameters:
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

**Response includes:**
- Complete summary
- Savings rate
- Average income/expense per transaction
- Monthly trends
- Top categories

#### 8. Get Month Comparison
```http
GET /api/dashboard/comparison/month
Authorization: Bearer <token>
```

## 👥 User Roles

### Admin
- Full system access
- Can create, view, update, and delete all records
- Can manage users (create, update, deactivate)
- Can view all analytics and insights
- Can access all dashboard features

### Analyst
- Can view all financial records
- Can create and update own records
- Can access all analytics and insights
- Cannot manage users
- Cannot delete records

### Viewer
- Can only view own financial records
- Can view own dashboard summaries
- Cannot create, update, or delete records
- Cannot access detailed insights
- Cannot manage users

## 📁 Project Structure
```
finance-backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Database connection
│   │   ├── schema.sql          # Database schema
│   │   ├── initDatabase.js     # Schema initialization
│   │   └── seedData.js         # Seed data script
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── userController.js   # User management
│   │   ├── recordController.js # Financial records
│   │   └── dashboardController.js # Analytics
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   └── authorize.js        # Authorization middleware
│   ├── models/
│   │   ├── userModel.js        # User database operations
│   │   ├── roleModel.js        # Role database operations
│   │   ├── recordModel.js      # Record database operations
│   │   └── dashboardModel.js   # Analytics queries
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── userRoutes.js       # User endpoints
│   │   ├── recordRoutes.js     # Record endpoints
│   │   ├── dashboardRoutes.js  # Dashboard endpoints
│   │   └── index.js            # Route aggregator
│   ├── utils/
│   │   ├── jwt.js              # JWT utilities
│   │   ├── response.js         # Response helpers
│   │   ├── validation.js       # Input validation
│   │   └── recordValidation.js # Record validation
│   └── server.js               # Application entry point
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
├── package.json                # Dependencies
└── README.md                   # Documentation
```

## 🧪 Testing

### Manual Testing with cURL

All endpoints can be tested using the examples provided in the API Documentation section above.

### Test Flow Example

**1. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.com","password":"admin123"}'
```

**2. Create Record**
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount":1000,"type":"income","category":"Salary","description":"Monthly salary"}'
```

**3. View Dashboard**
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

### Testing with Postman

1. Import the API endpoints into Postman
2. Set up environment variable for the token
3. Test each endpoint with different user roles

## 🎯 Design Decisions

### Architecture
- **MVC Pattern**: Separation of concerns with Models, Controllers, and Routes
- **Middleware-based Auth**: Reusable authentication and authorization
- **Service Layer in Models**: Business logic encapsulated in model classes

### Database
- **PostgreSQL**: Chosen for robust relational data handling
- **Soft Deletes**: Records are marked as deleted, not removed
- **Indexed Columns**: Performance optimization on frequently queried fields
- **Row-Level Security**: Implemented via application logic based on user roles

### Security
- **JWT Authentication**: Stateless, scalable authentication
- **bcrypt Password Hashing**: Industry-standard password security
- **Role-Based Access Control**: Granular permissions per user role
- **Input Validation**: Server-side validation for all inputs

### API Design
- **RESTful Principles**: Standard HTTP methods and status codes
- **Consistent Response Format**: All responses follow the same structure
- **Query Parameter Filtering**: Flexible data retrieval
- **Pagination Support**: Efficient handling of large datasets

### Error Handling
- **Centralized Error Handler**: Consistent error responses
- **Appropriate HTTP Status Codes**: Semantic status codes
- **Detailed Error Messages**: Clear feedback for developers
- **Development vs Production**: Different error detail levels

## 🔒 Security Considerations

- **Environment Variables**: Sensitive data stored in `.env` file
- **Password Hashing**: All passwords hashed with bcrypt (salt rounds: 10)
- **JWT Expiration**: Tokens expire after 7 days
- **SQL Injection Prevention**: Parameterized queries
- **CORS Enabled**: Cross-origin resource sharing configured
- **Input Validation**: All inputs validated before processing

## 📈 Assumptions & Tradeoffs

### Assumptions
- Users are pre-registered by administrators
- Financial records are in a single currency
- Date format is always YYYY-MM-DD
- All monetary amounts are positive numbers

### Tradeoffs
- **Soft Delete vs Hard Delete**: Chose soft delete for data recovery
- **JWT vs Session**: JWT for statelessness and scalability
- **Application-Level vs DB-Level Security**: Application logic for flexibility
- **Simplicity vs Features**: Balanced features with code clarity

## 🚧 Future Enhancements

- [ ] Pagination for all list endpoints
- [ ] Search functionality across records
- [ ] Export data to CSV/PDF
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Budget planning features
- [ ] Unit and integration tests
- [ ] API rate limiting
- [ ] Swagger/OpenAPI documentation
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📝 License

This project is created for the Zorvyn Backend Developer Internship assignment.

## 👨‍💻 Author

**Anirban Das**
- Email: anirbandas64237@gmail.com

## 🙏 Acknowledgments

Built as part of the Zorvyn FinTech Backend Developer Internship assignment.

For any questions or issues, please contact the author.

---

Built with ❤️ for Financial Management