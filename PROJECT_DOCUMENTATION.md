# AquaFlow Shipping & Logistics Intelligence Platform
## Complete Technical Architecture & User Flow Documentation

Welcome to the official technical and operational documentation for the **AquaFlow Shipping Enterprise Command Center**. This document provides an end-to-end breakdown of the project architecture, design system, component hierarchy, data management, and user flow journeys across all platform modules.

---

## 1. Executive Overview & Technology Architecture

AquaFlow Shipping is an enterprise-grade maritime command dashboard designed to centralize fleet intelligence, shipment tracking, port traffic coordination, and operational analytics into a unified, high-performance web interface.

### Core Technology Stack
- **Frontend Framework**: React 18 with functional components, custom hooks, and React memoization.
- **Build Tool & Bundler**: Vite (lightning-fast HMR and optimized production bundling).
- **Styling Paradigm**: Modular Vanilla CSS with CSS Custom Properties (Design Tokens), Glassmorphism overlays, and smooth CSS animations (`tokens.css`, `base.css`, `components.css`, `responsive.css`).
- **State Management**: Multi-tier React Context System:
  - `AuthProvider`: Manages user session, JWT-equivalent mock state, and Role-Based Access Control (RBAC).
  - `DataProvider`: Manages fleet vessels, active shipments, port schedules, and operational analytics metrics.
  - `ThemeProvider`: Handles Dark / Light mode theme toggling via data attributes on `<html>`.
  - `NotificationsProvider`: Manages live system alerts, weather advisories, and unread notification counts.
  - `ToastProvider`: Provides temporary feedback banners for user actions.
- **Routing**: Lightweight client-side hash & history router supporting nested layouts and permission guards (`Router.jsx`, `Can.jsx`).

---

## 2. Directory & Component Hierarchy

```
shipping/
├── public/                  # Static assets & favicon
├── src/
│   ├── assets/              # Branding assets (logo.png, hero images)
│   ├── components/
│   │   ├── charts/          # SVG/Canvas analytical charts (LineChart, BarChart, DonutChart, HeatMap)
│   │   ├── domain/          # Domain-specific UI cards (NotificationCard, VesselCard, ShipmentRow)
│   │   ├── layout/          # Layout shell components (AppShell, Sidebar, Topbar, Footer)
│   │   ├── ui/              # Primitive reusable UI controls (Button, StatCard, DataTable, Avatar, Inputs)
│   │   └── Icon.jsx         # Unified SVG Icon system
│   ├── data/                # Mock seed data (ships, shipments, ports, analytics)
│   ├── hooks/               # Custom React hooks (useClickOutside, useLocalStorage, useDebounce)
│   ├── pages/               # Application view pages
│   │   ├── auth/            # Login, Signup, Password Reset
│   │   ├── dashboard/       # Operations Overview & Performance Analytics
│   │   ├── fleet/           # Vessel list & live fleet tracking
│   │   ├── ports/           # Port activity & congestion monitoring
│   │   ├── shipment/        # Shipment management & new shipment creation
│   │   └── system/          # Settings, Profile, Help Center
│   ├── router/              # Custom Router components & NavLink helpers
│   ├── store/               # Context Providers (Auth, Data, Theme, Notifications, Toast)
│   ├── styles/              # Design System stylesheets
│   │   ├── tokens.css       # Color, spacing, shadow, radius, font tokens
│   │   ├── base.css         # Reset & global typography
│   │   ├── components.css   # Layout, card, button, table, hero, and utility styling
│   │   └── responsive.css   # Mobile and tablet media queries
│   ├── App.jsx              # Main App entry with context provider wrapper
│   └── main.jsx             # DOM mounting entry point
├── package.json             # Project dependencies & scripts
├── vite.config.js           # Vite build configuration
└── PROJECT_DOCUMENTATION.md # Project & User Flow Documentation (This File)
```

---

## 3. Design System & Theme Colors

The platform uses a curated maritime color palette defined as CSS custom properties in `tokens.css`:

### Color Palette
- **Deep Navy** (`--navy`: `#003366`, `--navy-900`: `#04182d`, `--navy-800`: `#07223e`): Primary branding, sidebar background, dark mode surfaces, and primary typography headings.
- **Ocean Blue** (`--ocean`: `#0099cc`, `--ocean-700`: `#007faa`, `--ocean-200`: `#9fdcf2`): Interactive accents, active tab highlights, primary button gradients, and focus rings.
- **Sky Light** (`--sky`: `#66ccff`, `--sky-100`: `#e8f8ff`): Soft highlights, badge backgrounds, dark mode text accents, and hover states.
- **Mist Neutrals** (`--mist`: `#f5f7fa`, `--mist-2`: `#e9eef5`): Light mode page background and subtle section dividers.
- **Ink Typography** (`--ink`: `#11253e`, `--ink-2`: `#1e3a5f`): Body text, table labels, and input values.
- **Status Indicators**:
  - `Success` (`#0a7d55` / `#e3f4ec`): Delivered, On Time, Normal Operations.
  - `Warning` (`#b7791f` / `#fdf3e0`): Delayed, Port Congestion, Pending Review.
  - `Danger` (`#c0392b` / `#fbeceb`): Storm Alerts, Maintenance Required, Cancelled.

### Logo & Branding Presentation
To guarantee a crisp, executive presentation, the AquaFlow logo (`logo.png`) is encased inside customized badge containers:
1. **Sidebar Badge Card** (`.sidebar-logo-card`): Crisp white rounded glass card with ambient ocean glow and soft depth shadow, ensuring the brand emblem stands out elegantly against the dark navy sidebar background.
2. **Topbar Header Emblem** (`.topbar-logo-badge`): Compact emblem badge paired with bold header text (`AquaFlow Command`).
3. **Authentication Screen Badge** (`.auth-logo-badge`): Prominent white card container anchored on the login hero panel.

---

## 4. End-to-End User Flow Journeys

```
[ User Access ] ──> [ Login / Auth ] ──> [ RBAC Permission Check ]
                                                    │
        ┌───────────────────┬───────────────────────┼───────────────────────┬──────────────────┐
        ▼                   ▼                       ▼                       ▼                  ▼
[ 1. Dashboard ]   [ 2. Shipments ]       [ 3. Live Tracking ]      [ 4. Port Traffic ]  [ 5. Notifications ]
 - Network Hero     - Dispatch & Search    - Vessel Maps & ETA       - Quay Congestion    - Weather Alerts
 - Stat Cards       - Status Pipeline      - Fleet Maintenance       - Schedule Booking   - Read & Resolve
 - Revenue Charts   - New Shipment Form    - Capacity Booker         - Traffic Index      - Priority Filter
```

### Flow 1: User Authentication & Role-Based Access Control (RBAC)
1. **Login**: User accesses `/login`, enters credentials (e.g. `amira@aquaflow.com` / `password`).
2. **Session Initialization**: `AuthProvider` validates credentials, stores token/user state, and resolves assigned role permissions (`shipment.manage`, `fleet.view`, `report.view`, `settings.view`).
3. **Role Profiles**:
   - **Admin / Director**: Full access across all modules including system settings and financial reports.
   - **Dispatcher**: Access to shipment management, new shipment forms, and live tracking.
   - **Port Operations Manager**: Focused access to port traffic, vessel docking schedules, and fleet status.

### Flow 2: Operations Command Overview (Dashboard)
1. **Navigation**: User arrives at `/dashboard`.
2. **Executive Welcome Banner**:
   - Displays personalized greeting ("Welcome back, Ebrahim").
   - Live pulse indicator ("GLOBAL LOGISTICS COMMAND").
   - Real-time status pills: Active Ships Count, Delayed Shipments Count, Fleet Utilization Percentage.
   - Action buttons: `+ Create Shipment`, `Analytics & Reports`.
3. **Key Performance Stat Cards**:
   - 6 high-density cards displaying Total Ships, Active Shipments, Completed Deliveries, Monthly Revenue, Fleet Utilization, Active Customers.
   - Interactive hover elevation and trend delta chips (`+6%`, `+12%`, `-3%`).
4. **Analytical Chart Grid**:
   - **Revenue vs Operating Cost**: Interactive line trend comparing revenue against operational expenditures.
   - **Shipment Status Distribution**: Donut chart breaking down active shipments into In Transit, Delayed, Pending, Delivered, In Port.
   - **Monthly Deliveries**: Bar chart showing monthly completed shipments.
   - **Fleet Capacity Utilization**: Radial progress ring indicating booked vs available vessel space.
   - **Port Activity Heatmap**: Weekly vessel traffic density map across key global hubs (Jebel Ali, Singapore, Rotterdam, Shanghai, Hamburg).
5. **Operational Activity Lists**:
   - **Recent Shipments Table**: Live shipment records with route, customer, status, ETA, and cost.
   - **Latest System Alerts**: Real-time storm advisories, delay notifications, and dock inspection notices.
   - **Active Fleet Quick List**: Vessel names, types, current ports, and status chips.

### Flow 3: Shipment Lifecycle & Operations Management
1. **View All Shipments**: User navigates to `/shipments`.
2. **Filter & Search**: Filter by status (In Transit, Pending, Delayed, Delivered) or search customer/vessel names in real time.
3. **Create New Shipment**:
   - User clicks `+ New Shipment` (`/shipments/new`).
   - Fills in origin port, destination port, customer account, cargo volume, vessel assignment, and estimated delivery date.
   - On submission, `DataProvider` updates active shipments, triggers a toast notification, and updates dashboard status distribution.

### Flow 4: Live Fleet Tracking & Vessel Intelligence
1. **Fleet View**: User navigates to `/ships` or `/tracking`.
2. **Map & List Integration**:
   - Inspect active vessel positions, vessel type (Container Ship, Tanker, Bulk Carrier), engine load, and current speed in knots.
   - View fuel efficiency and maintenance schedules.
3. **Vessel Detail Modal**: Inspect crew capacity, last dock inspection, and assigned cargo manifest.

### Flow 5: Port Traffic & Congestion Control
1. **Port Dashboard**: User navigates to `/ports`.
2. **Hub Monitoring**: Inspect vessel traffic index for major international ports (Jebel Ali, Singapore, Rotterdam, etc.).
3. **Berth Allocation**: Check dock availability, waiting times, and incoming vessel arrivals.

### Flow 6: System Notifications & Alerts Management
1. **Bell Icon Badge**: Topbar notification bell displays live unread counter (`3`).
2. **Notification Drawer**: Clicking bell or navigating to `/notifications` shows categorized notifications:
   - **Critical Alerts**: Weather/storm warnings (Force 9 near Bay of Biscay).
   - **Operational Delay**: Vessel congestion updates.
   - **Scheduled Maintenance**: Dry-dock inspection reminders.
3. **Action**: User marks alerts as read or filters by priority.

### Flow 7: Performance & Financial Analytics
1. **Analytics Dashboard**: User navigates to `/analytics` or `/reports`.
2. **Financial Intelligence**: Inspect YTD revenue, gross profit margin, operating expenses, and fuel consumption trends over time.
3. **Export Reports**: Download CSV/PDF operational summary reports.

---

## 5. Development & Deployment Guidelines

### Local Development Setup
1. Clone repository and install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open browser at `http://localhost:5173`.

### Production Build
1. Bundle static assets:
   ```bash
   npm run build
   ```
2. Preview production build locally:
   ```bash
   npm run preview
   ```

---

*Documentation compiled and maintained for AquaFlow Shipping & Logistics Intelligence Platform.*
