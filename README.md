
# Zing Call

Zing Call is a high-performance, real-time video conferencing application. It enables users to connect instantly through secure video meetings, featuring a robust backend for signaling and a responsive frontend for a seamless user experience.

## 🚀 Features

* **Real-time Video Meetings**: Low-latency video and audio communication using WebRTC.
* **Instant Join**: Generate and join meeting rooms with unique codes.
* **User Authentication**: Secure user registration and login system with JWT-based session handling.
* **Meeting History**: Track past meetings and call logs through a dedicated dashboard.
* **Dynamic Signaling**: Real-time peer-to-peer connection management powered by Socket.io.
* **Responsive UI**: A modern, mobile-friendly interface built with React and custom CSS modules.

## 🛠️ Tech Stack

### Frontend
* **Framework**: React (Vite)
* **Real-time Communication**: Socket.io-client
* **State Management**: React Context API
* **Styling**: CSS Modules
* **Routing**: React Router DOM

### Backend
* **Runtime**: Node.js with Express
* **Database**: MongoDB (via Mongoose)
* **Real-time Server**: Socket.io
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## 📋 Prerequisites

* Node.js (v16 or higher)
* MongoDB instance (Local or Atlas)
* NPM or Yarn

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd Zing-call
```

### 2. Backend Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=8080
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Install Dependencies
**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Development Mode
**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

The application will typically be available at `http://localhost:5173` (Vite default).

## 📂 Project Structure

* `/backend`: Node.js/Express server, Socket.io logic, and MongoDB schemas.
* `/frontend`: React application containing components, contexts, and meeting logic.
* `/backend/src/controllers/socketManager.js`: Core logic for managing WebRTC signaling and room joins.
