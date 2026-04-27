# 💰 Smart Expense Tracker

A production-ready MERN stack web application for tracking expenses with smart analytics, budget management, and predictive insights.

## ✨ Features

### Authentication
- JWT-based authentication with secure httpOnly cookies
- User registration & login with validation
- Forgot password with reset token functionality

### Expense Management
- Add, edit, and delete income & expenses
- Fields: amount, category, date, note, type (income/expense)
- Categories: food, travel, bills, shopping, health, others
- Auto category suggestion based on text input (keyword matching)

### Smart Analytics
- Monthly spending analytics (Bar & Line charts)
- Category-wise breakdown (Pie chart)
- Budget limit with visual progress bars and alerts
- Expense prediction using linear regression on historical data
- Total balance, income, expense summary cards

### Dashboard
- Responsive sidebar layout
- Summary cards (balance, income, expense, savings)
- Charts: Bar (monthly comparison), Pie (category breakdown), Line (trend)
- Recent transactions list
- Budget alerts with warning indicators

### Exports
- CSV export for spreadsheet analysis
- PDF report generation with formatted tables
- Date range and type filtering

### UI/UX
- Clean, modern responsive design with Tailwind CSS
- Dark mode support
- Mobile-friendly sidebar with overlay
- Loading states and error handling

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| Export | PDFKit (PDF), Manual CSV |

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── config/          # Database config
│   ├── controllers/     # API controllers
│   ├── middleware/      # Auth, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── utils/           # Helpers
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React contexts
│   │   ├── pages/       # Page components
│   │   └── utils/       # Formatters
├── README.md
└── TODO.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Backend Setup

```bash
cd backend
npm install
# Create .env file from .env.example
cp .env.example .env
# Update MONGO_URI in .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

## 📱 Screenshots

| Dashboard | Transactions | Budget |
|-----------|-----------|--------|
| Summary cards, charts | Table with filters | Progress bars, alerts |

## 🔒 API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Transactions
- `GET /api/transactions` - List (with filters)
- `GET /api/transactions/:id` - Get one
- `POST /api/transactions` - Create
- `PUT /api/transactions/:id` - Update
- `DELETE /api/transactions/:id` - Delete
- `GET /api/transactions/suggest-category` - Auto-suggest

### Dashboard
- `GET /api/dashboard/summary` - Balance summary
- `GET /api/dashboard/monthly-analytics` - Monthly data
- `GET /api/dashboard/category-breakdown` - Category data
- `GET /api/dashboard/recent` - Recent transactions
- `GET /api/dashboard/budget-alerts` - Budget warnings
- `GET /api/dashboard/prediction` - Expense prediction

### Budget
- `GET /api/budget` - List budgets
- `POST /api/budget` - Create budget
- `PUT /api/budget/:id` - Update
- `DELETE /api/budget/:id` - Delete

### Export
- `GET /api/export/csv` - CSV export
- `GET /api/export/pdf` - PDF export

## 🧮 Prediction Algorithm

Uses simple linear regression on the last 6 months of expense data:

```
y = mx + b
```

Where `m` is the slope and `b` is the intercept. The next month's predicted expense is calculated by extrapolating the trend line.

## 🎯 Smart Features

- **Auto Category Suggestion**: Keyword matching on transaction notes (e.g., "swiggy" → food, "petrol" → travel)
- **Budget Alerts**: Visual warnings when spending reaches 80% or exceeds 100% of budget
- **Expense Prediction**: Linear regression-based forecasting for next month expenses
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-first approach with collapsible sidebar

## 📝 License

MIT
