# 🚐 SchoolRide – School Van Transport Management System

SchoolRide is a MERN stack web application that helps manage school van
transportation. It connects **administrators**, **parents** and **drivers**
on one platform to make school transport safer, easier to manage and more
convenient for everyone.

## 📖 About the Project

Many parents depend on school vans to take their children to and from school,
but they often have no easy way to know whether their child has been picked up,
has reached school, or has arrived home safely. Van owners and administrators
also manage students, routes and monthly fees manually.

SchoolRide solves this by providing one online system where:
- **Parents** register their children and track their daily journey status.
- **Drivers** view their daily pickup list and update each student's status.
- **Administrators** manage vans, drivers, routes, assignments and payments.

### Example Workflow
1. A parent registers and adds their child's details and pickup location.
2. The administrator reviews the request and assigns a van and driver.
3. The driver views the daily student pickup list.
4. The driver updates pickup, school arrival and drop-off status.
5. The parent checks the journey status online.
6. The parent views monthly fees and payment history.

## 👥 User Roles

| Role | Main Responsibilities |
|------|----------------------|
| **Admin** | Manage parents, students, drivers, vans and routes; assign students to vans; manage payments; view complaints and reports |
| **Parent** | Manage own children's details; request van service; track journey status; view fees and payment history; submit complaints |
| **Driver** | View assigned van and route; view daily pickup list; update pickup and drop-off status; report delays and emergencies |

## ✨ Key Features (Planned)

- 🔐 Secure role-based login for Admin, Parent and Driver
- 👨‍👩‍👧 Student and parent management
- 🚐 Driver and van management with seating capacity
- 🗺️ Route and pickup point management
- 🪑 Van capacity check – prevents assigning more students than available seats
- ✅ Safe pickup verification – pickup → school arrival → drop-off at home
- ⏰ Delay notifications to affected parents
- 🚨 Emergency and complaint reporting
- 📅 Attendance and journey history
- 💳 Monthly fee and payment tracking
- 📊 Daily and monthly reports with charts

## 🛠️ Technology Stack

| Layer          | Technology                      |
|----------------|---------------------------------|
| Frontend       | React (Vite), CSS / Tailwind CSS |
| Backend        | Node.js, Express.js             |
| Database       | MongoDB (Mongoose)              |
| Authentication | JWT, role-based authorization   |
| Maps           | Leaflet, OpenStreetMap          |
| Charts         | Recharts                        |

## 🏗️ System Architecture

```
React (Frontend)  ⇄  Express + Node.js (Backend API)  ⇄  MongoDB (Database)
```

- The **React** frontend displays pages and sends requests to the backend.
- The **Express** backend checks permissions and handles business logic.
- **MongoDB** stores users, students, vans, routes, trips and payments.

## 📁 Project Structure

```
webdev/
├── client/        # React frontend (coming soon)
├── server/        # Express backend API (coming soon)
├── docs/          # Project documentation
│   └── project-plan.md
├── .gitignore
└── README.md
```

## 🚀 Getting Started

Setup and run instructions will be added as the project develops.

### Clone the Repository
```bash
git clone https://github.com/Jana511/web_online_transport_management_system.git
```

## 🔒 Security

Because this system handles children's personal information and journey
status, it follows basic security practices:
- Passwords are hashed before being stored.
- JWT tokens are used for authentication.
- Users can only access pages allowed for their role.
- Parents can only view their own children's records.
- Secret keys are stored in `.env` files and never uploaded to GitHub.

## 📌 Project Status

🟡 **In development** – Day 1: Project initialization

- [x] Project setup and documentation
- [ ] Frontend setup (React + Vite)
- [ ] Home, login and registration pages
- [ ] Backend setup (Node.js + Express)
- [ ] MongoDB connection and data models
- [ ] Admin, parent and driver features
- [ ] Payments and notifications
- [ ] Testing and final documentation

## 👤 Author

**K. Janani Chamika**
Faculty of Engineering, University of Ruhuna
GitHub: [@Jana511](https://github.com/Jana511)

---
*This project was developed as part of a university Web Development module.*