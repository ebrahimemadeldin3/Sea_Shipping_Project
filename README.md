# Navora - Sea Shipping & Logistics Platform

A modern, responsive sea freight shipping and cargo management platform built with React and Vite. Navora connects cargo shippers with maritime freight operators, offering end-to-end shipment lifecycles, real-time cargo tracking, invoicing, and customer support.

---

## 🌟 Key Features

### 🚢 Public Landing Page & Tracking
- **Hero & Fleet Showcase**: Interactive interface showcasing global routes, transit statistics, and port networks.
- **Cargo Tracking**: Real-time status lookup by tracking number (`SEA-2026-XXXXX`) with step-by-step milestone timelines and sample test buttons.
- **Global Operations Hubs**: Interactive route visualizer connecting key maritime ports (Alexandria, Genoa, Rotterdam, Shanghai).
- **Direct Inquiries**: Integrated contact and inquiry form with immediate confirmation.

### 👤 Customer Portal (`/dashboard`)
- **New Shipment Wizard**: 5-step guided shipment creation with form validation (Route selection, Cargo specs, Contact details, Review & Submit).
- **Copy Tracking Number**: 1-click clipboard copy with visual feedback for quick reference sharing.
- **Active Shipments**: Filterable and searchable shipment list with live status badges.
- **Shipment Details Drawer**: Detailed cargo specs, carrier assignments, and milestone progress.
- **Invoices & Billing**: Itemized tariff breakdown (Ocean freight, BAF, Port handling) with 1-click online payment processing.
- **Customer Support**: Ticket submission, issue categorization, and conversation threads with operator reply capability.
- **Account Settings**: Profile updates, password changes, notification preference toggles, and demo reset.

### 🏢 Company Operations Portal (`/company`)
- **Operational Dashboard**: Overview metrics for pending requests, vessels in transit, and completed deliveries.
- **Quote & Schedule Management**: Accept requests with custom pricing, currency, assigned vessel, and departure/arrival dates.
- **Rejection Flow**: Reject unfeasible requests with logged operational notes.
- **Transit Status Pipeline**: Move shipments through milestones (`ACCEPTED`, `PREPARING`, `LOADED`, `DEPARTED`, `IN_TRANSIT`, `CUSTOMS_CLEARANCE`, `ARRIVED_PORT`, `DELIVERED`).
- **Responsive Tables**: Auto-converting card layout optimized for mobile screens.
- **Real-Time Toast Alerts**: Visual confirmation toasts on accept, reject, and status update actions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router DOM v7
- **Build Tool**: Vite 8
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design System (Custom tokens, glassmorphism, responsive grids, shimmer animations)
- **Code Quality**: Oxlint

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ebrahimemadeldin3/Sea_Shipping_Project.git
   cd Sea_Shipping_Project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Run linting:
   ```bash
   npm run lint
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🔑 Demo Accounts

Use the 1-click demo buttons on the Login page (`/auth`) or sign in with:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Customer** | `ahmed@example.com` | `password123` | Customer Dashboard (`/dashboard`) |
| **Company Operator** | `admin@navora.demo` | `password123` | Company Operations Portal (`/company`) |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
