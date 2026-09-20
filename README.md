# MedTrack 🏥

![MedTrack Application](https://raw.githubusercontent.com/username/medtrack/main/frontend/public/bg.jpg)

MedTrack is a modern, closed-loop digital tracking and automated restocking platform designed to solve critical systemic issues in rural healthcare supply chains. It stops medicine diversion, prevents artificial stockouts, and enforces distributor delivery timelines.

## Features ✨

* **Pharmacist Terminal:** Secure dispensing with Aadhaar/Health ID and automated SMS receipts (via Textbelt) ensuring the patient becomes the auditor.
* **Distributor Portal:** Allows distributors to seamlessly log incoming medical consignments and fulfill SLA-tracked restock orders.
* **Admin Console:** A high-level district view providing real-time stock visibility and an Escalation Watchdog to catch SLA breaches automatically.
* **Auto-Restock System:** Automatically fires a restock order to distributors when local inventory falls below a predefined 15% threshold.
* **Zero-Capex UI:** A stunning, premium Dark-Mode Glassmorphism UI built to run directly in modern web browsers with no specialized hardware needed.

## Tech Stack 🛠️

* **Frontend:** React.js, Vite, React Router, Custom Glassmorphism CSS
* **Backend:** Node.js, Express.js
* **Database:** SQLite (Zero-config local database)
* **Integrations:** Textbelt API (Real SMS Verification)

## How to Run the Project Locally 🚀

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/medtrack.git
cd medtrack
```

### 2. Start the Backend Server
The backend handles the API and the SQLite database.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start the server (runs on http://localhost:3001)
node index.js
```

### 3. Start the Frontend Application
Open a **new terminal window/tab**, and start the React frontend.

```bash
# Navigate to the frontend directory from the project root
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 4. View the App
Open your browser and navigate to `http://localhost:5173`. 
*Note: The local SQLite database (`medtrack.db`) is generated automatically when you start the backend server for the first time.*

## SMS Testing Note 📱
The backend uses the [Textbelt](https://textbelt.com/) API to send a real SMS receipt when medicine is dispensed. Textbelt allows **1 free SMS per day per IP address**. When testing, ensure you enter your phone number with the proper country code (e.g., `+1` or `+91`). If the daily limit is reached, the system gracefully falls back to a simulated receipt.

## License
MIT License
