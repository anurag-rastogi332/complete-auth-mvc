# Complete Authentication MVC

React + Node.js + Express + MongoDB + Nodemailer authentication project.

Features:
- Register
- Email OTP verification
- Resend OTP
- OTP expiry
- Login
- JWT authentication
- Protected profile
- Edit profile
- Change password
- Forgot password
- Reset password with OTP
- Logout
- Admin role
- Admin user list
- Simple React UI

## Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_long_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Run:

```bash
npm run dev
```

## Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open:

http://localhost:5173

The backend uses MVC:

```text
server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── server.js
```
