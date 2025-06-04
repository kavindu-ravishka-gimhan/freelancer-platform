==========================================================
                   FREELANCER_WEB_APP
                  Freelance Platform - WorkLux
==========================================================

WorkLux is a full-stack freelance platform connecting skilled freelancers with clients.
It features secure authentication, job management, project tracking, and Stripe-powered payments.

----------------------------------------------------------
                      Project Structure
----------------------------------------------------------

FREELANCER_WEB_APP/
│
├── backend/                  # Express.js backend
│    └── .env                # Backend environment variables
│
├── src/                     # React frontend components (inside project root)
├── public/                  # React public assets
├── package.json             # Frontend dependencies and scripts
├── README.md                # This documentation file

----------------------------------------------------------
                      Prerequisites
----------------------------------------------------------

• Node.js (v16+ recommended)
• MySQL
• Git

----------------------------------------------------------
                     Backend Setup
----------------------------------------------------------

1) Open terminal and navigate to backend folder:
   > cd backend

2) Install backend dependencies:
   > npm install

3) Create a `.env` file inside backend/ folder with:

   DB_HOST=localhost
   DB_USER=root
   DB_PASS=12345678
   DB_NAME=freelancer_web_app
   PORT=5000

   JWT_SECRET=your jwt secret key

   STRIPE_SECRET_KEY=your stripe secret key

   ADMIN=admin@email.com
   ADMIN_PASSWORD=12345678..

4) Start backend server:
   > npm run dev

----------------------------------------------------------
                     Frontend Setup
----------------------------------------------------------

1) From project root (FREELANCER_WEB_APP), install frontend dependencies:
   > npm install

2) Start React frontend:
   > npm start

----------------------------------------------------------
                    Admin Credentials
----------------------------------------------------------

Email:    admin@email.com
Password: 12345678..

----------------------------------------------------------
                       Payments
----------------------------------------------------------

Stripe Connect Express is integrated for payment processing.  
Use Stripe test credentials during development.

----------------------------------------------------------
                       Database
----------------------------------------------------------

Make sure a MySQL database named `freelancer_web_app` is created and accessible.

----------------------------------------------------------
                       Features
----------------------------------------------------------

• Role-based login: Client & Freelancer  
• Post & apply for jobs  
• Track ongoing projects  
• Secure file delivery and reviews  
• Stripe-based payment after job completion  
• Admin dashboard with stats and user management  

==========================================================
