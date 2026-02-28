<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge" />
</p>

<h1 align="center">🏪 Inventory Pro — Frontend</h1>

<p align="center">
  <strong>A sleek, modern inventory management dashboard built for real-world hardware retail.</strong><br/>
  Designed & developed for a hardware shop — built to scale, ready to sell.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-pages--modules">Modules</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-interested-in-buying">Buy</a>
</p>

---

## ✨ Features

| Module | Highlights |
|--------|-----------|
| 🔐 **Authentication** | Secure JWT login with role-based access (Admin / Salesman) |
| 📦 **Products** | Full CRUD, add quantity to existing stock, auto-updated remaining inventory |
| 🧾 **Billing** | Generate **Original**, **Dummy**, and **Udhaar (Credit)** invoices with live receipt preview & print |
| 👥 **Buyers** | Track credit customers, add payments, validation against remaining balance |
| 🚚 **Suppliers** | Manage purchase records, add payments, update total payable, auto-calculated totals from unit price × quantity |
| 📊 **Dashboard** | Developer analytics dashboard with key business metrics |
| 🔍 **Smart Search** | Real-time filtering across all tables |
| 🎨 **Modern UI** | Glassmorphism, dark theme, smooth animations, fully responsive |

### 💡 Smart Business Logic

- **Stock-Aware Billing** — Products with zero stock are hidden from the billing dropdown
- **Payment Validation** — Can't pay more than what's owed; remaining amounts never go negative
- **Instant UI Updates** — Deleting a record immediately recalculates totals (no page refresh needed!)
- **Auto Total Calculation** — Supplier purchases compute total from `Unit Price × Quantity`
- **Cascading Deletes** — Deleting a buyer/supplier/product also removes related transactions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + Vite 7 |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Styling** | Custom CSS with glassmorphism, gradients & animations |
| **Deployment** | Vercel |

---

## 📄 Pages & Modules

```
src/pages/
├── Login.jsx              # JWT Authentication
├── DeveloperDashboard.jsx # Admin analytics overview
├── Products.jsx           # Product management + stock tracking
├── Billing.jsx            # Invoice generation (Original / Dummy / Udhaar)
├── Buyers.jsx             # Credit buyer management + payment tracking
├── Suppliers.jsx          # Supplier & purchase management
└── RecentSales.jsx        # Sales history & transaction logs
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- Backend API running (see [Backend Repository](https://github.com/hassan-635/Inventory-Management-System) — *private*)

### Installation

```bash
# Clone the repository
git clone https://github.com/hassan-635/Inventory-Management-System-Frontend.git

# Navigate to project
cd Inventory-Management-System-Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be live at `http://localhost:5173` 🎉

### Environment Setup

The frontend connects to the backend API. Make sure the backend is running and the proxy is configured in `vite.config.js`.

---

## ☁️ Deployment

This project is deployed on **Vercel**:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

> **Note:** The backend is hosted separately and is a **private repository**.

---

## 🏗 Project Structure

```
Inventory-Management-System-Frontend/
├── public/
├── src/
│   ├── pages/          # All page components
│   ├── App.jsx         # Root component with routing
│   ├── App.css         # Global styles
│   └── main.jsx        # Entry point
├── vite.config.js      # Vite configuration + API proxy
├── package.json
└── README.md
```

---

## 💰 Interested in Buying?

This is a **production-ready inventory management system** built for a real hardware shop. It includes:

- ✅ Complete frontend + backend
- ✅ Supabase (PostgreSQL) database
- ✅ Role-based authentication
- ✅ Billing with 3 invoice types
- ✅ Credit (Udhaar) management
- ✅ Supplier payment tracking
- ✅ Stock management with validations
- ✅ Vercel-ready deployment

> **Want this system for your business?**  
> 📧 Reach out on GitHub: [@hassan-635](https://github.com/hassan-635)

---

<p align="center">
  <strong>Built with ❤️ for real businesses</strong><br/>
  <sub>Designed for a hardware shop. Ready for any retail business.</sub>
</p>
