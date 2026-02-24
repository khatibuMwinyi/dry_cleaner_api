# 🔧 Dry Cleaner API

RESTful API for dry cleaning business management with authentication, PDF generation, and analytics.

## 🚀 Quick Start
```bash
npm install
cp .env.example .env
npm run dev
```
Server runs on `http://localhost:5000`

## ⚙️ Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/dry_cleaner
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

## 🔐 Authentication
All routes (except `/auth/login`) require `Authorization: Bearer <token>` header.

**Roles**: ADMIN (full access), MODERATOR (limited access)

## 📚 Main Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register admin

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Invoices
- `GET /api/invoices` - Get invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id/pdf` - Download PDF
- `PUT /api/invoices/:id/payment` - Update payment

### Services
- `GET /api/services` - Get services
- `POST /api/services` - Create service
- `GET /api/services/executions` - Get service history

### Expenses
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Add expense (with receipt upload)

### Inventory
- `GET /api/inventory` - Get inventory
- `PUT /api/inventory/:id` - Update stock

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/monthly` - Monthly report
- `GET /api/analytics/monthly-pdf` - PDF report

## 🗃️ Database Models
- **User**: name, email, password, role
- **Customer**: name, email, phone, address, stats
- **Invoice**: items, totals, status, dates
- **Service**: name, price, category, duration
- **Expense**: description, amount, category, receipt

## 🛠️ Tech Stack
Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Cloudinary, PDF-lib, Puppeteer

## 📁 Project Structure
```
src/
├── controllers/    # Route handlers
├── models/         # Mongoose schemas
├── routes/         # API routes
├── middleware/     # Auth, uploads
├── config/         # DB, Cloudinary
└── utils/          # PDF generation
```
