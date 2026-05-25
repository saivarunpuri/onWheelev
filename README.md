# OnWheel EV

OnWheel EV is a web app for planning electric vehicle trips. It helps you find routes, locate charging stations, and connect with emergency services.

## Tech Stack
- Frontend: React, Vite, Ola Maps
- Backend: Node.js, Express
- Database: MongoDB
- Emails: Brevo API (used for OTP login)

## Setup

First, make sure you have Node.js installed. You also need accounts for MongoDB Atlas, Brevo, and ImageKit to get your API keys.

1. Clone the repo:
   ```bash
   git clone https://github.com/saivarunpuri/onWheelev.git
   cd onWheelev
   ```

2. Install dependencies for both folders:
   ```bash
   cd backend
   npm install
   
   cd ../frontend
   npm install
   ```

3. Set up environment variables:

   In the `backend` folder, create a `.env` file:
   ```text
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   BREVO_API_KEY=your_brevo_key
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=your_url
   OLA_MAPS_API_KEY=your_ola_key
   VITE_API_URL=http://localhost:5000
   ```

   In the `frontend` folder, create a `.env` file:
   ```text
   VITE_API_URL=http://localhost:5000
   VITE_OLA_MAPS_API_KEY=your_ola_key
   ```

4. Start the development servers:
   
   You need two terminal windows.
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

## Deployment Notes

- **MongoDB:** When you deploy to Vercel or Render, make sure your MongoDB Atlas network access is set to allow `0.0.0.0/0` so the live server can connect to the database.
- **Emails:** We use Brevo's HTTP API for emails instead of standard SMTP. This is because hosts like Vercel and Render block SMTP ports on free accounts. Make sure your Brevo key starts with `xkeysib-` (API key), not an SMTP key.
