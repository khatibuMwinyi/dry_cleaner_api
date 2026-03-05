# 🧼 Dry Cleaner API

A comprehensive RESTful API for dry cleaning business management with authentication, invoicing, customer management, inventory tracking, expense management, and analytics with PDF report generation.


## ✨ Features

- **Authentication & Authorization** - Secure JWT-based auth with role-based access control (Admin, Clerk, Operator)
- **Customer Management** - Full CRUD operations for customer records with stats tracking
- **Invoice Management** - Create, manage, and track invoices with payment status
- **Service Catalog** - Manage dry cleaning services with pricing and categories
- **Expense Tracking** - Track business expenses with receipt uploads
- **Inventory Management** - Monitor and update inventory stock levels
- **Analytics & Reports** - Dashboard insights and PDF report generation (daily, weekly, monthly)
- **PDF Generation** - Generate professional invoices and receipts using Puppeteer & pdf-lib
- **Cloud Storage** - Image and receipt uploads via Cloudinary

## 🚀 Quick Start

```bash
# Navigate to API directory
cd dry_cleaner_api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The server will run at `http://localhost:5000`

## ⚙️ Environment Variables

Create a `.env` file in the `dry_cleaner_api` directory:

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/dry_cleaner

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register new admin |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/:id` | Get invoice details |
| GET | `/api/invoices/:id/pdf` | Download invoice PDF |
| PUT | `/api/invoices/:id/payment` | Update payment status |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs |
| POST | `/api/jobs` | Create new job |
| PUT | `/api/jobs/:id` | Update job status |
| DELETE | `/api/jobs/:id` | Delete job |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| POST | `/api/services` | Create service |
| PUT | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |
| GET | `/api/services/executions` | Get service execution history |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add expense (with receipt upload) |
| DELETE | `/api/expenses/:id` | Delete expense |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get inventory items |
| POST | `/api/inventory` | Add inventory item |
| PUT | `/api/inventory/:id` | Update stock level |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard summary data |
| GET | `/api/analytics/monthly` | Monthly report data |
| GET | `/api/analytics/monthly-pdf` | Download monthly PDF report |

## 🔐 Authentication

All routes (except `/api/auth/login`) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Roles

The API supports three roles with different permission levels:

| Role | Capabilities |
|------|-------------|
| **ADMIN** | Full access - manage services, expenses, inventory, users; view all jobs, analytics & reports |
| **CLERK** | Manage customers, invoices (create, execute, generate PDF, send via WhatsApp); view jobs, verify jobs, send pickup notifications; view expenses, analytics & inventory |
| **OPERATOR** | View jobs, receive jobs, execute jobs, deny jobs; view service executions; view inventory |

Only **ADMIN** can register new users via `/api/auth/register-user`.

## 🗃️ Database Models

| Model | Description |
|-------|-------------|
| **User** | Admin, Clerk, and Operator accounts with authentication and role-based access |
| **Customer** | Customer profiles with contact info and stats |
| **Invoice** | Billing records with items, totals, and payment status |
| **Job** | Job orders with status tracking |
| **Service** | Available dry cleaning services with pricing |
| **Expense** | Business expenses with categories and receipts |
| **Inventory** | Stock items and quantities |

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT & bcryptjs
- **File Storage**: Cloudinary
- **PDF Generation**: Puppeteer & pdf-lib
- **API Testing**: Axios

## 📁 Project Structure

```
dry_cleaner_api/
├── src/
│   ├── config/           # Database & Cloudinary configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth & upload middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── templates/        # PDF templates
│   ├── utils/            # Utility functions
│   └── seed-services.js  # Initial data seeder
├── tmp/                  # Temporary files (invoices, receipts)
├── server.js             # Application entry point
└── package.json
```

## 🔗 Related Projects

This API powers the **Dry Cleaner Dashboard** frontend application:

- [dry_cleaner_ui](https://github.com/khatibuMwinyi/dry_cleaner_ui) - React-based admin dashboard

## 📄 License

ISC License

---

Built with ❤️ for dry cleaning businesses
