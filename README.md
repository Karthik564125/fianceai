💰 FinanceAI – Smart Personal Finance Manager with AI
FinanceAI is a full-stack web application designed to help users take control of their financial life. It enables seamless tracking of income, expenses, and savings, while providing AI-powered financial insights via Google Gemini.

Built with a focus on clean architecture, security, and DevOps best practices, this project demonstrates a production-ready workflow using Docker and GitHub Actions.

🚀 Features
🔐 Secure Auth: Firebase Authentication for seamless login/register.

📊 Financial Dashboard: Real-time overview of your financial health.

💸 Transaction Tracking: Detailed management of income and expenses.

📅 Bill Manager: Keep track of upcoming payments and deadlines.

📈 Data Visualization: Interactive charts and analytics powered by Recharts.

📤 Data Portability: Export your financial history to Excel files.

🤖 AI Financial Advisor: Integrated Gemini AI chatbot for personalized advice.

🖼️ Profile Management: Image uploads handled via Cloudinary.

🐳 Containerized: Fully Dockerized environment for consistent deployment.

⚙️ CI/CD Ready: GitHub Actions pipeline for automated builds and security audits.

🏗️ Architecture Overview
FinanceAI uses a hybrid architecture to balance performance with security:

Frontend (React): Communicates directly with Firebase for data and auth.

Backend (Node.js): Acts as a secure proxy for the Gemini API to protect sensitive API keys.

Database (Firestore): Stores user financial data with strict security rules.

🛠️ Tech Stack
Frontend
Framework: React + Vite + TypeScript

Styling: TailwindCSS + Framer Motion (Animations)

Charts: Recharts

State Management: React Context API

Backend
Runtime: Node.js + Express

AI Integration: Google Gemini SDK

Infrastructure: Docker & Docker Compose

Cloud Services
Authentication: Firebase Auth

Database: Cloud Firestore

Storage: Cloudinary (Profile Images)

🛡️ Security & Best Practices
Key Protection: Gemini API keys are strictly server-side; they are never exposed to the client.

Environment Safety: .env files are excluded from version control.

Firestore Rules: Strict security rules ensure users can only access their own data.

Automated Audits: The CI pipeline runs npm audit on every push to catch vulnerable dependencies.

🐳 Getting Started (Docker)
The easiest way to run the entire stack is using Docker Compose:

Bash
# Clone the repository
git clone https://github.com/yourusername/FinanceAI.git
cd FinanceAI

# Build and run the containers
docker-compose up --build
Frontend: http://localhost:4173

Backend: http://localhost:5000

⚙️ Manual Installation
1. Backend
Bash
cd backend
npm install
# Create a .env file with your GEMINI_API_KEY
node index.js
2. Frontend
Bash
cd frontend
npm install
# Create a .env file with your VITE_FIREBASE config
npm run dev
🔐 Environment Variables
Ensure you have the following keys set up in your local .env files:

Backend (/backend/.env):

GEMINI_API_KEY

Frontend (/frontend/.env):

VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

👤 Author
Karthik B.Tech CSE Final Year Full Stack Developer & DevOps Enthusiast

Tip: If you are a recruiter looking for the technical breakdown of the CI/CD pipeline or Docker configurations, please check the .github/workflows and docker-compose.yml files.
