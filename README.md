# 🏢 Smart Apartment Management System

A full-stack apartment management platform that streamlines tenant management, maintenance requests, rent tracking, visitor management, 
and community notices. Built with the PERN stack (PostgreSQL, Express, React, Node.js).

##  Features

- **👥 Tenant Management** - Add, edit, delete, and view tenant details with apartment assignments
- **🔧 Maintenance Requests** - Tenants can submit requests, managers can update status (Pending → Assigned → In Progress → Resolved)
- **💰 Rent Tracking** - Track rent payments, mark as paid, view payment history and summaries
- **🚪 Visitor Management** - Register visitors with auto-generated OTP codes for secure building access
- **📢 Notice Board** - Post, pin, and manage community announcements with expiration dates
- **📊 Dashboard** - Real-time statistics and overview of all activities
- **🔐 Role-Based Access** - Three roles: SUPER_ADMIN, MANAGER, TENANT with different permissions
- **🔑 JWT Authentication** - Secure login and session management

##  Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads

### Frontend
- **React** + **Vite** - Modern UI framework
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **React Router DOM** - Navigation
- **React Query** - Data fetching

##  Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-apartment-system.git
cd smart-apartment-system

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your database
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
