# BusinessFlow — Internal Business Management & Operations Platform

> Modern, lightweight, configurable internal business application engine inspired by **Zoho Creator** and **Zoho Projects**, crafted for small operational teams (4–5 members).

---

## 🚀 Key Highlights

- **Server-Independent Execution**: Fully operational out-of-the-box using a high-fidelity **reactive mock data engine** persisted in `localStorage`.
- **Seamless Supabase Ready**: Built with an abstraction layer that can immediately connect to a real PostgreSQL Supabase instance when credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are provided in `.env`.
- **Enterprise-Grade UI**: Desktop-first SaaS design aesthetic inspired by Linear, Airtable, and Zoho Projects, featuring compact data tables, interactive filter builders, slide-over detail drawers, and drag-and-drop kanban boards.

---

## 📦 Implemented Modules

### 1. Module 1: Task Management (Zoho Projects Inspired)
- **Multi-View System**:
  - `All Tasks` (Master tabular report with custom sorting, column management, pagination, and multi-select).
  - `My Tasks` (Dynamically filtered by active team identity).
  - `Pending Tasks`, `Completed Tasks`, and `Overdue Tasks` (highlighted deadlines with warning badges).
  - `Kanban Board` (Interactive status columns: *Not Started*, *In Progress*, *On Hold*, *Completed* with instant advancement).
- **Subtask Hierarchy**: Create and manage parent-child task structures, expand/collapse subtasks, independent deadlines, and automatic progress rollup.
- **Activity & Comments Feed**: Add chronological comments with team member attribution and timestamps.
- **Bulk Operations**: Bulk status changes (Mark In Progress, Mark Completed) and bulk deletion.

### 2. Module 2: Trainer Management (Zoho Creator Inspired)
- **KPI Metrics Header**: Real-time counter widgets for Total Trainers, Active Deployments, Companies Represented, and Discipline Categories.
- **Master Trainer Report**: Comprehensive searchable directory with column customization, CSV export, and quick contact action links (email, phone, LinkedIn).
- **Advanced Report Builder**:
  - Visual criteria builder with AND / OR logical grouping.
  - Multi-operator matching (`contains`, `equals`, `greater_than`, `less_than`, `between`, `is`, `is_empty`).
  - Saved reports management (switch between saved presets like *"Manufacturing & Lean Specialists"*, *"Pune & Mumbai Local Trainers"*, *"Automation & Robotics Experts"* or save new custom views).
- **Profile Detail Drawer**: Complete trainer portfolio view with delivery formats, industrial experience, session topics, and confidential notes.

### 3. Module 3: Google Drive Folder Management
- **Master Asset Directory**: Catalog of registered Google Drive folders, Shared Drives, and master spreadsheets.
- **Direct Workspace Integration**: One-click *"Open Link"* action directly launching external Google Workspace resources in a new browser tab.
- **Taxonomy & Categorization**: Categorization across departments (*Operations, Training & Delivery, Finance, Leadership, Sales*) with searchable tags and access guidelines.

### 4. Shared Application Engine & System Overview
- **Collapsible Sidebar & Global Header**: Breadcrumbs, system health indicators, and global command search (`Ctrl+K`) searching across all three modules simultaneously.
- **Identity Switcher**: Switch active member identity among the 5 team members to simulate assignments, creator actions, and personalized views.
- **Executive Dashboard**: KPI counters, interactive Recharts visualizations (Task Status Bar Chart and Trainer Disciplines Pie Chart), and upcoming deadlines feed.
- **System Settings**: Factory seed data reset, JSON backup export, and team roster overview.

---

## 🛠️ Quick Start

```bash
# Navigate to the client directory
cd client

# Install dependencies (already prepared)
npm install

# Start the local development server
npm run dev

# Build for production
npm run build
```
