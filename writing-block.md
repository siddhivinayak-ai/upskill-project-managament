# BusinessFlow — Internal Business Workflow & Automation Platform

> A lightweight, configurable internal business management system inspired by Zoho Creator and Zoho Projects, designed for a small team of 4–5 employees.

---

# 1. Product Overview

## 1.1 Vision

Build a centralized internal business application that simplifies everyday business operations through structured data management, customizable forms, advanced reports, task tracking, and Google Drive folder management.

The application should combine the flexibility of **Zoho Creator** with the task management capabilities of **Zoho Projects**, without unnecessary enterprise complexity.

This is NOT just a collection of CRUD pages.

The objective is to build a reusable business application engine where employees can:

- Create and manage records.
- Build and customize forms.
- Generate custom reports from master datasets.
- Search and filter records using multiple criteria.
- Customize table columns, widths, and views.
- Create dashboards with meaningful widgets.
- Manage relationships between different records.
- Edit, update, delete, and inspect records easily.

## 1.2 Target Users

- Small business with approximately 4–5 employees.
- Internal operational use.
- Desktop-first application.
- Employees with basic computer knowledge.

## 1.3 Core Technology

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Backend | Supabase |
| Database | PostgreSQL |
| Data Fetching | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| Tables | TanStack Table |
| Drag and Drop | dnd-kit |
| Charts | Recharts |

Use modular, maintainable code.

Do not introduce unnecessary technologies or microservices.

---

# 2. Product Scope

The first version consists of three major modules.

1. Task Management
2. Trainer Management
3. Google Drive Folder Management

All modules should share common design patterns, table components, form components, CRUD operations, filtering logic, and UI behaviour.

## Important Development Constraints

- Do NOT implement authentication in this version.
- Do NOT implement role-based access control yet.
- Do NOT build heavy media upload functionality.
- Do NOT store photos or videos.
- Google Drive files should be managed through external links.
- Focus on CRUD, data relationships, reporting, search, and UI quality.
- Use Supabase as the central database.
- Make the interface desktop-first but responsive.

---

# 3. Application Layout & Navigation

## 3.1 Main Layout

Create a professional business application layout.

### Sidebar

The sidebar should contain:

- Application logo/name.
- Dashboard.
- Tasks.
- Trainers.
- Drive Management.
- Settings.

Use collapsible sidebar navigation.

### Main Content

The main content area should dynamically display the selected module.

### Global UI Elements

- Breadcrumb navigation.
- Page title and description.
- Search functionality.
- Primary action button.
- Notification area.
- Consistent spacing and typography.

## 3.2 Design Direction

The application should look like a modern professional SaaS product.

Design references:

- Zoho Creator
- Zoho Projects
- Linear
- Airtable
- Monday.com

Visual requirements:

- Clean, minimalist interface.
- White and light-neutral backgrounds.
- Subtle borders.
- Professional typography.
- Limited accent colours.
- Compact but readable tables.
- Minimal unnecessary cards.
- Smooth transitions.
- Consistent spacing.
- Clear visual hierarchy.

Avoid:
- Excessive gradients.
- Oversized dashboard cards.
- Unnecessary animations.
- Decorative graphics.
- Excessive rounded corners.
- Consumer-style mobile app aesthetics.

The application should feel like a serious internal business management tool.

---

# 4. MODULE 1 — TASK MANAGEMENT

## 4.1 Objective

Create a task management module inspired by Zoho Projects.

The purpose is to assign, track, organize, and monitor internal business activities.

## 4.2 Default Screen: All Tasks

When an employee opens the Tasks module, the default screen should display the All Tasks report.

### Header

Display:

- Page title: Tasks
- Description: Manage and track internal activities.
- Search bar.
- Filter button.
- View selector.
- `+ New Task` button.

### Task Table

Suggested columns:

| Column | Description |
|---|---|
| Task Name | Task title |
| Status | Not Started, In Progress, Completed, On Hold |
| Priority | Low, Medium, High, Urgent |
| Assigned To | Employee responsible |
| Start Date | Task start date |
| Due Date | Deadline |
| Progress | Completion percentage |
| Created Date | Record creation timestamp |

The table should support:

- Sorting.
- Filtering.
- Multi-select.
- Bulk deletion.
- Bulk status updates.
- Column resizing.
- Column drag-and-drop.
- Column visibility customization.
- Row selection.
- Inline editing where appropriate.
- Pagination.
- Search.

## 4.3 Create New Task

Clicking `+ New Task` should open a detailed task creation form.

The form should preferably open in a large modal or dedicated form page.

### Fields

**Basic Information**

- Task Name (required).
- Task Description.
- Task Category.
- Project/Group (optional).

**Assignment**

- Assigned To.
- Created By.
- Collaborators (multi-select).

**Timeline**

- Start Date.
- Due Date.
- Reminder Date.

**Task Classification**

- Priority.
- Status.
- Colour Label.
- Tags.

**Task Structure**

- Parent Task.
- Subtasks.

**Additional Information**

- Internal Notes.
- Comments.

### Form Behaviour

- Required field validation.
- Date validation.
- Dropdowns should support searchable options.
- Multi-select fields should support multiple values.
- Save and Cancel actions.
- Display confirmation after successful creation.
- Newly created records must immediately reflect in the All Tasks report.

## 4.4 Subtask Management

Tasks should support hierarchical relationships.

Example:

Project: Website Development

- Main Task: Develop Website
  - Subtask: Design UI
  - Subtask: Develop Backend
  - Subtask: Database Integration
  - Subtask: Testing

Requirements:

- A task can have multiple subtasks.
- Subtasks should be visible beneath their parent.
- Support expand/collapse.
- Each subtask should have independent status and deadline.
- Parent task progress should optionally reflect subtask completion.

## 4.5 Task Details

Clicking a task should open a right-side detail drawer.

Display:

- Task title.
- Description.
- Assigned employees.
- Status.
- Priority.
- Timeline.
- Subtasks.
- Notes.
- Comments.
- Created date.
- Last updated date.

Provide Edit and Delete actions.

## 4.6 Task Comments

Employees should be able to add comments to tasks.

Each comment should contain:

- Comment text.
- Author.
- Timestamp.

Comments should be displayed chronologically.

## 4.7 Task Views

Implement the following views:

1. All Tasks — default table.
2. My Tasks — tasks assigned to the current employee.
3. Completed Tasks.
4. Pending Tasks.
5. Overdue Tasks.
6. Kanban View — grouped by status.

The Kanban view should support drag-and-drop status changes.

---

# 5. MODULE 2 — TRAINER MANAGEMENT

## 5.1 Objective

Create a centralized Trainer Management System.

The business problem:

The organization frequently faces difficulties identifying previously contacted trainers, their expertise, training categories, associated companies, and contact details.

The application should eliminate this problem by maintaining a structured trainer database with advanced reporting and search capabilities.

## 5.2 Module Architecture

The Trainer module should have three primary components:

1. Forms
2. Reports
3. Dashboard

The default landing screen should be the Trainer Dashboard.

## 5.3 Trainer Dashboard

The dashboard should display meaningful KPIs.

Suggested KPIs:

- Total Trainers.
- Active Trainers.
- Companies Represented.
- Training Categories.
- Recently Added Trainers.

Below the KPI section, display the Master Trainer Report.

The dashboard should also support configurable widgets.

## 5.4 Add Trainer Form

The top-right corner should contain:

`+ Add Trainer`

Clicking this button should open the Master Trainer Form.

### Suggested Fields

**Personal Information**

- Trainer Name (required).
- Phone Number.
- Email Address.
- Location.
- LinkedIn Profile (optional).

**Professional Information**

- Company Name.
- Designation.
- Experience.
- Trainer Category.
- Areas of Expertise.
- Specialization.

**Training Information**

- Training Topics.
- Categories of Sessions Conducted.
- Previous Training Experience.
- Industries Served.
- Mode of Training (Online / Offline / Hybrid).

**Additional Information**

- Internal Notes.
- Source of Contact.
- Trainer Status.
- Created By.
- Created At.
- Last Updated At.

Allow dropdowns, multi-select fields, text fields, date fields, and searchable selections.

All trainer records must be saved in the master PostgreSQL table.

## 5.5 Master Trainer Report

This is one of the most important parts of the application.

The Master Trainer Report should provide complete CRUD functionality.

### Required Capabilities

- Add records.
- Edit records.
- Delete records.
- View records.
- Inline editing.
- Multi-select.
- Bulk actions.
- Sorting.
- Filtering.
- Searching.
- Column customization.
- Column resizing.
- Column reordering.
- Pagination.
- Export to CSV.

### Row Context Menu

Right-clicking a record should open a context menu.

Options:

- View Details.
- Edit.
- Duplicate.
- Delete.

The Edit action should open the corresponding form with existing values prefilled.

The View Details action should open the right-side detail drawer.

Deleting should require confirmation.

## 5.6 Advanced Report Builder

This is a core product feature.

Employees should be able to create customized reports from the Master Trainer dataset.

### Example Scenario

Suppose an employee wants to identify:

All trainers who:

- Conducted Manufacturing training.
- Have more than 5 years of experience.
- Belong to Pune OR Mumbai.

The employee should be able to create a custom report using an advanced criteria builder.

### Report Builder Requirements

Create a visual filter builder.

Each filter condition should contain:

- Field.
- Operator.
- Value.

Supported operators should depend on field type.

Examples:

| Field Type | Operators |
|---|---|
| Text | Equals, Contains, Starts With, Is Empty |
| Number | Equals, Greater Than, Less Than, Between |
| Date | Before, After, Between, Is Empty |
| Dropdown | Is, Is Not |
| Multi-select | Contains, Does Not Contain |
| Boolean | Is True, Is False |

### AND / OR Logic

Allow employees to combine multiple conditions.

Example:

(Trainer Category = Manufacturing AND Experience > 5)

OR

(Trainer Category = Automation AND Location = Pune)

Support nested groups where practical.

### Saved Reports

Employees should be able to:

- Create a new report.
- Rename a report.
- Duplicate an existing report.
- Edit report criteria.
- Save changes.
- Delete a report.
- Set a default report.
- Switch between saved reports.

IMPORTANT:

Saved reports must store their configuration, not duplicate the underlying trainer records.

A report configuration should contain:

- Report Name.
- Source Table.
- Selected Columns.
- Filter Conditions.
- AND/OR Groups.
- Sorting.
- Grouping.
- Column Order.
- Column Widths.
- Created At.
- Updated At.

## 5.7 Advanced Search Engine

Implement a powerful search experience.

Requirements:

- Search across multiple fields.
- Search by trainer name.
- Search by company.
- Search by training category.
- Search by expertise.
- Search by location.
- Search by keywords.
- Support combined search criteria.
- Searchable dropdowns.
- Multi-select filters.

Search should be fast and return relevant records.

## 5.8 Customizable Table Views

Users should be able to:

- Drag and drop columns.
- Change column widths.
- Hide columns.
- Show hidden columns.
- Rename displayed column labels.
- Sort multiple columns.
- Apply filters.
- Save custom views.
- Change row density.
- Rearrange table layouts.

Persist saved view configurations.

## 5.9 Custom Reports and Subreports

Support additional reports generated from the master trainer dataset.

Examples:

- Manufacturing Trainers.
- Automation Trainers.
- Trainers by Company.
- Trainers by Location.
- Trainers with More Than 10 Years Experience.
- Recently Added Trainers.

Subreports should support filtered views related to their parent records where applicable.

---

# 6. MODULE 3 — GOOGLE DRIVE FOLDER MANAGEMENT

## 6.1 Objective

Create a centralized registry of Google Drive folders and documents.

The application will not store actual files.

It will store metadata and corresponding Google Drive URLs.

## 6.2 Drive Dashboard

Display:

- Total Registered Folders.
- Recently Added Folders.
- Categories.
- Folders Created This Month.

Below the KPI section, display the Master Drive Report.

## 6.3 Add Drive Folder Form

Provide a `+ Add Folder` button.

Suggested fields:

**Basic Information**

- Folder Name (required).
- Description.
- Folder Category.
- Department.

**Drive Information**

- Google Drive Link (required).
- Parent Folder (optional).
- Folder Type.

**Management Information**

- Created By.
- Created At.
- Last Updated At.
- Internal Notes.
- Tags.

The Google Drive URL must be validated for basic URL correctness.

Provide an Open Drive action that opens the external link in a new browser tab.

## 6.4 Master Drive Report

Implement complete CRUD functionality.

Required columns:

- Folder Name.
- Category.
- Department.
- Drive Link.
- Created By.
- Created At.
- Last Updated At.

Required features:

- Advanced search.
- Filters.
- Sorting.
- Multi-select.
- Bulk deletion.
- Inline editing.
- Row context menu.
- Detail drawer.
- Column customization.
- Saved views.
- CSV export.

---

# 7. SHARED APPLICATION ENGINE

This section is extremely important.

Do not independently develop the same table, form, filtering, and reporting functionality three times.

Build reusable components and shared utilities.

## 7.1 Dynamic Forms

Forms should support:

- Text fields.
- Number fields.
- Email fields.
- Phone fields.
- Date fields.
- Date-time fields.
- Dropdowns.
- Multi-select dropdowns.
- Checkboxes.
- Radio buttons.
- Text areas.
- URL fields.
- Searchable dropdowns.

Each field should support:

- Label.
- Placeholder.
- Required/Optional.
- Default Value.
- Validation.
- Field Description.
- Visibility.
- Display Order.

Use reusable form configurations where appropriate.

## 7.2 Dynamic Tables

Create a reusable advanced table component.

It should support:

- Server-side or efficient client-side pagination.
- Sorting.
- Filtering.
- Multi-select.
- Column resizing.
- Column reordering.
- Column visibility.
- Row actions.
- Inline editing.
- Bulk operations.
- Custom empty states.
- Loading states.
- Error states.

Use TanStack Table.

## 7.3 Right-Side Detail Drawer

When a user clicks a row, open a right-side drawer.

The drawer should:

- Display record information.
- Use a clean custom layout.
- Show related records.
- Provide Edit and Delete actions.
- Support different templates for different modules.

Do not navigate away from the current report unnecessarily.

## 7.4 Reusable Report Engine

The reporting engine should support:

- Source dataset selection.
- Column selection.
- Column arrangement.
- Filtering.
- AND/OR conditions.
- Sorting.
- Grouping.
- Saved report configurations.
- Report duplication.
- Report renaming.
- Report deletion.

Keep report configurations separate from source records.

## 7.5 Dashboard Widget Engine

Allow dashboards to contain configurable widgets.

Initial widget types:

- KPI Counter.
- Record Count.
- Bar Chart.
- Pie Chart.
- Recent Records.
- Custom Report Table.

Users should be able to:

- Add widgets.
- Remove widgets.
- Rearrange widgets.
- Resize widgets.
- Configure data sources.
- Save dashboard layouts.

Do not build a complex drag-and-drop dashboard editor before the core modules work.

---

# 8. DATABASE DESIGN — SUPABASE

Use PostgreSQL through Supabase.

Design the database with proper relationships, indexes, constraints, and timestamps.

Suggested tables:

## 8.1 Employees

| Column | Type |
|---|---|
| id | UUID |
| name | TEXT |
| email | TEXT |
| created_at | TIMESTAMPTZ |

No login or authentication functionality is required.

Employee records can initially be seeded manually.

## 8.2 Tasks

| Column | Type |
|---|---|
| id | UUID |
| title | TEXT |
| description | TEXT |
| status | TEXT |
| priority | TEXT |
| assigned_to | UUID |
| parent_task_id | UUID |
| start_date | DATE |
| due_date | DATE |
| progress | INTEGER |
| color | TEXT |
| created_by | UUID |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

## 8.3 Task Comments

| Column | Type |
|---|---|
| id | UUID |
| task_id | UUID |
| author_id | UUID |
| comment | TEXT |
| created_at | TIMESTAMPTZ |

## 8.4 Trainers

| Column | Type |
|---|---|
| id | UUID |
| trainer_name | TEXT |
| email | TEXT |
| phone | TEXT |
| location | TEXT |
| company_name | TEXT |
| designation | TEXT |
| experience | NUMERIC |
| categories | TEXT[] |
| expertise | TEXT[] |
| training_topics | TEXT[] |
| industries_served | TEXT[] |
| training_mode | TEXT[] |
| status | TEXT |
| linkedin_url | TEXT |
| notes | TEXT |
| created_by | UUID |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

## 8.5 Trainer Reports

| Column | Type |
|---|---|
| id | UUID |
| report_name | TEXT |
| source_table | TEXT |
| configuration | JSONB |
| is_default | BOOLEAN |
| created_by | UUID |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Store filters, selected columns, ordering, sorting, grouping, and layout configuration in JSONB.

## 8.6 Drive Folders

| Column | Type |
|---|---|
| id | UUID |
| folder_name | TEXT |
| description | TEXT |
| category | TEXT |
| department | TEXT |
| drive_url | TEXT |
| parent_folder_id | UUID |
| folder_type | TEXT |
| tags | TEXT[] |
| notes | TEXT |
| created_by | UUID |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

## 8.7 Saved Views

| Column | Type |
|---|---|
| id | UUID |
| module | TEXT |
| view_name | TEXT |
| configuration | JSONB |
| created_by | UUID |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

## 8.8 Dashboard Widgets

| Column | Type |
|---|---|
| id | UUID |
| module | TEXT |
| widget_type | TEXT |
| configuration | JSONB |
| position | JSONB |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Use appropriate foreign keys and indexes.

For arrays, consider normalized relational tables if the data needs independent management, relationships, or complex querying. Avoid unnecessary denormalization.

IMPORTANT DATABASE NOTE:

Authentication is out of scope, but Supabase must still be configured safely. Do not expose service-role keys in frontend code. Configure suitable development access policies and never deploy an unauthenticated, unrestricted production database.

---

# 9. FRONTEND ARCHITECTURE

Organize the React application into reusable modules.

Suggested structure:

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── PageLayout.tsx
│   │
│   ├── tables/
│   │   ├── DataTable.tsx
│   │   ├── TableToolbar.tsx
│   │   ├── ColumnManager.tsx
│   │   ├── FilterBuilder.tsx
│   │   └── RowContextMenu.tsx
│   │
│   ├── forms/
│   │   ├── DynamicForm.tsx
│   │   ├── FormField.tsx
│   │   └── FormDialog.tsx
│   │
│   ├── drawers/
│   │   └── RecordDetailDrawer.tsx
│   │
│   ├── dashboard/
│   │   ├── KPIWidget.tsx
│   │   ├── ChartWidget.tsx
│   │   └── RecentRecords.tsx
│   │
│   └── common/
│
├── modules/
│   ├── tasks/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   ├── trainers/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   └── drive/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── validators.ts
│
├── types/
│
└── styles/
```

The architecture can evolve as the application grows.

Keep business logic separate from presentation components.

---

# 10. IMPORTANT UX INTERACTION REQUIREMENTS

The application should feel responsive and intuitive.

### Record Creation

1. Employee clicks Add.
2. Form opens.
3. Employee fills required information.
4. Employee clicks Save.
5. Data is saved to Supabase.
6. Report updates automatically.
7. Success feedback is displayed.

### Record Editing

1. Employee right-clicks a record.
2. Selects Edit.
3. Form opens with existing data.
4. Employee updates fields.
5. Employee clicks Save.
6. Updated data reflects in all relevant reports.

### Custom Report Creation

1. Employee opens Report Builder.
2. Selects source dataset.
3. Selects columns.
4. Adds conditions.
5. Combines conditions using AND/OR.
6. Applies sorting and grouping.
7. Previews results.
8. Saves report configuration.

### Record Inspection

1. Employee clicks a row.
2. Right-side drawer opens.
3. Record details are displayed.
4. Employee can edit or delete the record.

All these interactions should work without unnecessary full-page reloads.

---

# 11. NON-FUNCTIONAL REQUIREMENTS

## Performance

- Fast page loading.
- Efficient database queries.
- Avoid unnecessary API calls.
- Use pagination for large reports.
- Debounce search inputs.
- Optimize React rendering.

## Reliability

- Validate all input.
- Handle database failures.
- Prevent accidental deletion.
- Display useful error messages.
- Confirm destructive operations.

## Maintainability

- Reusable components.
- TypeScript types.
- Modular architecture.
- Consistent naming conventions.
- Clear separation of frontend and database logic.

## Data Integrity

- Proper foreign keys.
- Required field validation.
- Consistent timestamps.
- Safe delete behaviour.
- Avoid duplicate records where uniqueness is required.

---

# 12. IMPLEMENTATION ROADMAP

Build the application in phases.

Do not attempt to build every feature simultaneously.

## Phase 1 — Foundation

- Initialize React + TypeScript.
- Configure Tailwind CSS.
- Install shadcn/ui.
- Configure Supabase.
- Create the application layout.
- Implement sidebar navigation.
- Create shared components.
- Establish database schema.

Deliverable: Working application shell.

## Phase 2 — Shared CRUD Engine

- Create reusable form components.
- Create reusable table components.
- Implement create, read, update, delete.
- Implement record detail drawer.
- Implement context menus.
- Implement search and sorting.
- Implement pagination.

Deliverable: Functional reusable CRUD foundation.

## Phase 3 — Trainer Management

Prioritize this module because it contains the most important reporting requirements.

- Trainer master form.
- Trainer master report.
- Dashboard.
- Advanced search.
- AND/OR filter builder.
- Saved reports.
- Report duplication.
- Column customization.
- Right-side detail drawer.

Deliverable: Fully functional Trainer Management module.

## Phase 4 — Task Management

- All Tasks report.
- Create Task form.
- Task assignment.
- Subtasks.
- Comments.
- Deadlines.
- Status management.
- Kanban view.
- Task detail drawer.

Deliverable: Fully functional Task Management module.

## Phase 5 — Drive Management

- Drive folder form.
- Master Drive Report.
- CRUD.
- Drive link validation.
- Search and filters.
- Saved views.
- Detail drawer.

Deliverable: Fully functional Drive Registry.

## Phase 6 — Customization & Polish

- Dashboard widgets.
- Reusable saved views.
- Advanced column management.
- Bulk operations.
- CSV export.
- Performance optimization.
- UI consistency.
- Error handling.
- Testing.

Deliverable: Stable first release.

---

# 13. ACCEPTANCE CRITERIA

The application is considered ready for its first release when:

### General

- All three modules are accessible.
- Navigation works correctly.
- UI is consistent.
- Database connections work.
- No authentication is implemented.
- All CRUD operations work.

### Tasks

- Tasks can be created and edited.
- Subtasks work.
- Employees can be assigned.
- Deadlines and statuses work.
- Comments are saved.
- Kanban view works.

### Trainers

- Trainer records can be created, edited, viewed and deleted.
- Advanced search works.
- AND/OR filters work.
- Reports can be saved and duplicated.
- Reports use the same underlying master dataset.
- Columns can be reordered and resized.
- Detail drawer works.

### Drive

- Folder records can be created, edited, viewed and deleted.
- Drive URLs work.
- Search and filtering work.
- Metadata is saved correctly.

### Shared Features

- Multi-select works.
- Sorting works.
- Filtering works.
- Column customization works.
- Bulk actions work.
- Loading, empty and error states exist.
- Changes persist after page refresh.

---

# 14. OUT OF SCOPE — VERSION 1

Do not spend development time on:

- Authentication.
- User registration.
- Complex permissions.
- Role-based access.
- Heavy media storage.
- Video uploads.
- Photo uploads.
- AI chatbot.
- Payment integrations.
- Mobile application.
- Complex automation workflows.
- External CRM integrations.
- Enterprise-level audit infrastructure.

These can be considered in later versions.

---

# 15. INSTRUCTIONS TO ANTIGRAVITY GPT

You are acting as a Senior Full-Stack Engineer, Product Architect, and UI/UX Designer.

Your responsibility is to build this application according to the requirements documented above.

Follow these instructions strictly:

1. Read the complete README before writing code.
2. Understand the shared application architecture.
3. Do not build three independent CRUD implementations.
4. Prioritize reusable components.
5. Build one phase at a time.
6. Verify every major interaction before moving forward.
7. Keep the database schema consistent with the application.
8. Do not use mock data as a replacement for Supabase integration in completed modules.
9. Seed realistic sample data for development.
10. Maintain TypeScript type safety.
11. Avoid unnecessary dependencies.
12. Do not implement authentication.
13. Do not introduce heavy file storage.
14. Do not compromise UI quality for development speed.

### Critical Development Rule

Do not create a static UI prototype and declare the application complete.

Every visible action must perform its intended function.

Every form must save data.

Every table action must work.

Every report must apply its saved configuration.

Every filter must return the correct records.

Every edit must persist.

### Development Workflow

Before implementing each phase:

- Review the relevant requirements.
- Identify dependencies.
- Plan the components.
- Implement the functionality.
- Test the complete user workflow.
- Fix errors.
- Update this README if the implementation or approved requirements change.

Do not silently remove features from the specification.

If a requirement is technically problematic, explain the issue and propose a practical alternative before changing the architecture.

---

# FINAL PRODUCT OBJECTIVE

Build a clean, reliable, configurable internal business management application.

The application should make it easy for a small team to:

- Manage daily tasks.
- Maintain a centralized trainer database.
- Find historical trainer information instantly.
- Generate customized reports.
- Manage Google Drive folders.
- Organize business information.
- Perform everyday operations from one centralized interface.

**The guiding principle:**

Build the simplicity of a small internal tool with the flexibility of a professional business application.

Do not overengineer.

Do not underdeliver.

Prioritize functionality, usability, data integrity, and maintainability.

**End of Product Requirements Document.**
