# InterviewIQ.AI — AI-Powered Mock Interview Platform

InterviewIQ.AI is a full-stack web application that helps job seekers practice interviews using AI. It generates role-specific interview questions, conducts voice-based interview sessions, evaluates answers in real time, and provides detailed performance reports.

---

## Live Demo

🔗 [Click here to view](https://interviewiq-ai-client-1lxj.onrender.com) 

---

## Features

- **Google Authentication** — Sign in with Google via Firebase OAuth
- **Resume Upload & Analysis** — Upload PDF resume; AI extracts role, skills, and projects automatically
- **AI Question Generation** — GPT-4o-mini generates 5 personalized interview questions based on role, experience, mode, and resume
- **Voice Interview** — AI interviewer speaks questions aloud; candidate answers via microphone using Web Speech API
- **Real-time Answer Evaluation** — Each answer is scored on Confidence, Communication, and Correctness by AI
- **Per-question Timer** — Configurable time limits (60s easy, 90s medium, 120s hard)
- **Performance Report** — Detailed analytics with circular score, skill breakdown bars, and performance trend chart
- **PDF Download** — Download formatted interview report with candidate details and question-wise feedback
- **Interview History** — View all past interview sessions with scores and status
- **Credits System** — 100 free starter credits; purchase more via Razorpay
- **Admin Panel** — Monitor users, interviews, and payments; edit user credits

---

## Tech Stack

**Frontend**
- React.js 18 + Vite
- Tailwind CSS
- Framer Motion
- Redux Toolkit
- React Router v6
- Recharts
- React Circular Progressbar
- jsPDF + jsPDF-AutoTable
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Token (JWT)
- Multer (file uploads)
- PDF.js (pdfjs-dist)
- Cookie Parser

**Services & APIs**
- OpenRouter API (GPT-4o-mini) — question generation & answer evaluation
- Firebase — Google OAuth
- Razorpay — payment gateway
- Web Speech API — text-to-speech & speech-to-text

---

## Project Structure

```
interviewiq-ai/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Step1SetUp.jsx     # Interview setup form
│   │   │   ├── Step2Interview.jsx # Live voice interview
│   │   │   ├── Step3Report.jsx    # Performance report
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AuthModel.jsx
│   │   │   └── Timer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── InterviewPage.jsx
│   │   │   ├── InterviewHistory.jsx
│   │   │   ├── InterviewReport.jsx
│   │   │   ├── Pricing.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── redux/
│   │   │   └── userSlice.js
│   │   ├── utils/
│   │   │   └── firebase.js
│   │   └── App.jsx
│
├── server/                        # Express backend
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── interview.controller.js
│   │   ├── payment.controller.js
│   │   ├── user.controller.js
│   │   └── admin.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── interview.model.js
│   │   └── payment.model.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── interview.route.js
│   │   ├── payment.route.js
│   │   ├── user.route.js
│   │   └── admin.route.js
│   ├── middlewares/
│   │   ├── isAuth.js
│   │   ├── isAdmin.js
│   │   └── multer.js
│   ├── services/
│   │   ├── openRouter.service.js
│   │   └── razorpay.service.js
│   ├── config/
│   │   ├── connectDb.js
│   │   └── token.js
│   └── index.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project with Google Sign-In enabled
- OpenRouter API key
- Razorpay account (test mode works)

---

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Start the server:

```bash
nodemon index.js
```

---

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the client directory:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Start the dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`  
Backend runs on `http://localhost:8000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Google login / register |
| GET | `/api/auth/logout` | Logout user |
| GET | `/api/user/current-user` | Get current user data |
| POST | `/api/interview/resume` | Upload and analyze resume |
| POST | `/api/interview/generate-questions` | Generate interview questions |
| POST | `/api/interview/submit-answer` | Submit and evaluate answer |
| POST | `/api/interview/finish` | Complete interview and get report |
| GET | `/api/interview/get-interview` | Get user's interview history |
| GET | `/api/interview/report/:id` | Get interview report by ID |
| POST | `/api/payment/order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify payment and add credits |
| GET | `/api/admin/stats` | Platform stats (Admin only) |
| GET | `/api/admin/users` | All users (Admin only) |
| PUT | `/api/admin/user/credits` | Edit user credits (Admin only) |
| DELETE | `/api/admin/user/:id` | Delete user (Admin only) |
| GET | `/api/admin/interviews` | All interviews (Admin only) |
| GET | `/api/admin/payments` | All payments (Admin only) |

---

## How the Interview Works

1. **Setup** — User enters role, experience, selects Technical or HR mode, and optionally uploads resume
2. **Question Generation** — Backend sends profile data to GPT-4o-mini which returns 5 adaptive questions (2 easy, 2 medium, 1 hard)
3. **Voice Interview** — AI reads each question using TTS; user speaks their answer which is transcribed via STT
4. **Evaluation** — Each answer is sent to AI for scoring on three parameters: Confidence, Communication, Correctness
5. **Report** — Aggregate scores are calculated and displayed with charts; PDF can be downloaded

---

## Credits System

| Plan | Credits | Price |
|------|---------|-------|
| Free (default) | 100 | ₹0 |
| Starter Pack | 150 | ₹100 |
| Pro Pack | 650 | ₹500 |

Each interview session costs **50 credits**.

---

## Admin Panel

Access the admin panel at `/admin`. To make a user admin, set `isAdmin: true` in their MongoDB document.

Admin features:
- Platform overview (total users, interviews, revenue)
- User management with credit editing
- All interviews grouped by user with report links
- Full payment transaction history

---

## Environment Variables Summary

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | Server | Express server port |
| `MONGODB_URI` | Server | MongoDB connection string |
| `JWT_SECRET` | Server | JWT signing secret |
| `OPENROUTER_API_KEY` | Server | OpenRouter API key |
| `RAZORPAY_KEY_ID` | Server + Client | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Server | Razorpay secret key |
| `VITE_FIREBASE_*` | Client | Firebase config variables |


---

## License

This project is licensed under the [MIT License](LICENSE)



---

## Author

**Umra Mirza** - [mirzaumra0@gmail.com](mailto:mirzaumra0@gmail.com) 


