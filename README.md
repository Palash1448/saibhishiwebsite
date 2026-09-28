# SaiBhishi - Production Bhishi & Finance Management Admin SaaS

**SaiBhishi** is an enterprise-grade, commercial Admin Management Web Application purpose-built for finance business owners, micro-financiers, and chit fund / Bhishi managers in India. 

It provides an end-to-end management suite for tracking members (KYC), multi-tier Bhishi investment plans, monthly payment collections, loan disbursements & repayments (with Flat and Reducing-balance EMI schedules), interest/returns distribution, operational expenses, receipt printing, and comprehensive auditing.

---

## 🌟 Key Features

### 1. 🛡️ Secure Admin Authentication & Authorization
- Firebase Authentication with email & password.
- Session persistence and protected routes.
- Role-based architecture ready for multi-admin access control.
- One-click instant **Demo Sandbox Mode** for evaluation without immediate Firebase credential setup.

### 2. 📊 Executive Real-Time Financial Dashboard
- **Top Financial KPIs**: Total Members, Active Members, Monthly Collections, Total Investment/Principal, Total Interest Credited, Total Loans Given, Outstanding Loan Amount, Recovered Loan Amount, Pending Monthly Payments, Overdue Loans.
- **5 Interactive Financial Charts (Recharts)**:
  1. *Monthly Collection Trend*: Actual collections vs. expected targets.
  2. *Investment vs Returns Chart*: Principal pool growth against interest distributions.
  3. *Loan Disbursement vs Recovery Chart*: Total capital deployed vs. recovered principal & interest.
  4. *Monthly Cashflow Chart*: Inflows, outflows, and net surplus.
  5. *Member Growth Chart*: Active, joined, and completed memberships over time.
- **Pending Actions & Alerts**: Immediate flagging of overdue payments, default risks, and loans nearing maturity.
- **Quick Action Bar**: `+ Add Member`, `+ Record Collection`, `+ Issue Loan`, `+ Record Repayment`, `+ Add Expense`, `+ Create Transaction`.

### 3. 👥 Comprehensive Member Management
- Full Indian KYC profile: Member ID/Code (`MEM-XXXX`), Full Name, Avatar/Photo, Mobile & WhatsApp Numbers, Email, Date of Birth, Full Address with Village/City and Pincode, Masked Aadhaar / PAN Reference (`XXXX-XXXX-1234`).
- **3-Tab Member Profile**:
  - *Personal KYC Details & Active Bhishi Plans*
  - *Comprehensive Financial Statement & Balances*
  - *Unified Ledger of All Member Transactions*
- Filter by status (*Active*, *Inactive*, *Completed*, *Suspended*), search by name/mobile/code, and instant CSV export.

### 4. 💰 Bhishi / Chit Fund Investment Management
- Configurable Bhishi Schemes:
  - Plan Name & Code (`BHI-XXXX`)
  - Monthly Contribution (₹)
  - Duration in Months
  - Calculated Total Principal (`Monthly × Duration`)
  - Configurable Annual Return/Interest Rate (%)
  - Return Calculation Engine (Simple Annual, Compound Annual, Flat Bonus)
  - Due Dates & Grace Periods
- Automatic maturity computation and tracking of active memberships.

### 5. 🧾 Monthly Collection Management & Official Receipts
- Real-time monthly collection sheet with multi-tier filters (Month, Year, Plan, Status).
- Statuses: *Paid*, *Pending*, *Partial*, *Overdue*.
- Supported Payment Modes: *Cash*, *UPI / GPay / PhonePe*, *Bank Transfer (NEFT/IMPS/RTGS)*, *Cheque*, *Other*.
- **Official Print-Ready Money Receipt Generator**:
  - Auto-generated receipt numbering (`REC-YYYY-XXXX`)
  - Legal Indian currency words (e.g. *"Rupees Fifty Thousand Only"*)
  - Business branding, member KYC details, transaction timestamps, payment method, UTR reference
  - 1-click **Print Receipt** (formatted for A4/Thermal) and direct **WhatsApp Share**.

### 6. 🏦 Complete Loan Management System
- Issue loans with customizable interest parameters:
  - Loan Amount / Principal (₹)
  - Configurable Monthly Interest Rate (%/month)
  - Loan Duration (Months)
  - **Flat Interest** vs **Reducing Balance EMI** calculation models
  - Upfront Processing Fee (%)
- **Automated Amortization Schedule**:
  - Installment Number, Due Date, Principal Component, Interest Component, Total Installment Amount, Paid Status.
- Outstanding loan balance tracking, default flags, and next due date notifications.

### 7. 💳 Loan Repayment Management
- Record partial or full installment payments.
- Automatic allocation to outstanding interest and principal.
- Real-time recalculation of remaining balance and next scheduled due dates.

### 8. 📜 Centralized Master Financial Ledger & Non-Destructive Audit
- Immutable ledger tracking every financial inflow and outflow:
  - *Investments*, *Monthly Collections*, *Interest Credits*, *Loan Disbursements*, *Loan Repayments*, *Processing Fees*, *Expenses*, *Reversals*, *Adjustments*.
- **Strict Data Integrity**:
  - In-memory & Firestore-level idempotency protection to prevent duplicate entries on page refresh or double clicks.
  - Safe **Reversal Workflow**: Financial records are never deleted silently; administrative reversals generate explicit offsetting ledger entries with an audit reason.

### 9. 📈 Yearly Returns & Interest Distribution
- Yearly interest distribution preview and crediting engine.
- Calculates exact pro-rata interest based on member tenure and plan configuration.
- Stores immutable interest credit vouchers with instant financial ledger updates.

### 10. 🏢 Operational Expense Tracker
- Categorized business expenditures: *Office*, *Salary*, *Rent*, *Electricity*, *Travel*, *Marketing*, *Maintenance*, *Other*.
- Receipt voucher attachments and cashflow impact calculation.

### 11. 📑 Reports & Business Intelligence
- 10 Ready-to-use Financial Statements:
  1. *Monthly Collection Statement*
  2. *Member Investment Report*
  3. *Yearly Interest Distribution Report*
  4. *Loan Disbursement Summary*
  5. *Loan Repayment Ledger*
  6. *Outstanding Loans & Overdue Aging Report*
  7. *Master Transactions Ledger*
  8. *Cash Flow Statement*
  9. *Profit & Loss / Interest Margin Statement*
  10. *Individual Member Financial Statement*
- Filter by date range, instant print layout, and UTF-8 BOM CSV export for Excel compatibility.

### 12. 🧮 Interactive Financial Calculators
- Standalone Bhishi Maturity Calculator (Principal, Tenure, Return Rate).
- Advanced Loan EMI Calculator (Flat vs Reducing Balance breakdown with full schedule preview).

### 13. ⚙️ Settings & Customization
- **Business Profile**: Firm Name, Registration/GSTIN, Contact Numbers, Address, Receipt & Transaction Prefixes.
- **Financial Defaults**: Default annual return rate, default monthly loan rate, default calculation method, payment grace period.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 19 + TypeScript** | Modern UI components with strict type-safety |
| **Vite** | Blazing-fast build tool and development server |
| **Tailwind CSS v4** | Clean, responsive dark navy & emerald styling |
| **Cloud Firestore & Firebase Auth** | Scalable real-time backend and secure authentication |
| **React Router v7** | Single Page Application routing with protected views |
| **Recharts** | Interactive charts for financial analytics |
| **Lucide React** | Clean, modern iconography |

---

## 🚀 Getting Started

### 1. Installation
```bash
# Clone or open the repository directory
cd saibhishi

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root by copying `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note**: If you run without Firebase credentials, the application automatically launches in **Local Sandbox Demo Mode** loaded with realistic Indian member profiles, loans, and collections!

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Firebase Security Rules

Deploy the included `firestore.rules` file to your Firebase console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

---

## 📱 Mobile & Tablet Responsive Design
SaiBhishi is fully optimized for all screen sizes:
- **Mobile (320px - 640px)**: Compact bottom navigation, responsive card view for tables, full-screen touch-friendly modals, and drawer navigation.
- **Tablet (768px - 1024px)**: Adaptive grid layouts and collapsable sidebar.
- **Desktop (1280px+)**: Multi-column dashboards, real-time KPI overview, and high-density financial tables.

---

© 2026 SaiBhishi Finance Management System. Designed for Indian microfinance and chit-fund businesses.
#   s a i b h i s h i w e b s i t e  
 