# NutriTrack Local Backend & Cybersecurity Architecture

A secure, standalone REST API backend for the **NutriTrack** mobile application (built with Node.js, Express, and SQLite), completely replacing cloud backends (Appwrite) with local self-hosted infrastructure.

---

## 🔒 Cybersecurity Requirements & Controls (ULBS Module 4 / OWASP MASVS)

| # | Security Control | Threat Mitigated | Technical Implementation |
|---|---|---|---|
| **1** | **Password Hashing (bcrypt)** | Credential theft, database dump exposure | Passwords hashed using `bcryptjs` with salt work factor = 12 (OWASP recommended). |
| **2** | **Session Tokens (JWT)** | Session hijacking, replay attacks | Stateless JSON Web Tokens signed with HS256, 24-hour expiration window, stored securely on device via AsyncStorage. |
| **3** | **SQL Injection Protection** | Data exfiltration, authentication bypass | 100% Parameterized queries using `better-sqlite3`. Zero dynamic string concatenation in SQL queries. |
| **4** | **Brute-Force & Credential Stuffing Defense** | Automated dictionary attacks, denial of service | `express-rate-limit` enforces strict thresholds on `/api/auth/*` (20 attempts / 15 minutes) and general API throttling (150 req/min). |
| **5** | **HTTP Security Headers** | Clickjacking, MIME-sniffing, XSS | `helmet` configured with strict headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `crossOriginResourcePolicy`). |
| **6** | **Authorization & BOLA Mitigation** | Broken Object Level Authorization (IDOR) | Endpoints verify `req.user.accountId === resource.userId`. Users cannot view or modify other accounts' logs or goals. |
| **7** | **Input Validation & Sanitization** | Stored XSS, format corruption | Strict regex validation for emails, password complexity rules (8+ chars, upper, lower, digit), numeric type checking. |
| **8** | **File Upload Hardening** | Unrestricted file upload, RCE, traversal | `multer` restricts uploads to 2MB maximum, enforces strict image MIME types (`image/jpeg`, `image/png`, `image/webp`), and strips user-provided paths with `path.basename`. |
| **9** | **Error Handling & Information Leakage** | Information disclosure / stack trace leak | Uniform generic error messages across all endpoints. No database errors or stack traces leaked to clients. |
| **10** | **Secrets Management** | Secret leakage in version control | Secrets (`JWT_SECRET`) loaded from `.env`, excluded via `.gitignore`, template provided in `.env.example`. |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` (a default `.env` is already created for local development):
```bash
cp .env.example .env
```

### 3. Start the Server
```bash
npm start
```
The server will start on port `3001` and output your machine's local LAN IP (e.g. `http://192.168.x.x:3001/api`), which Expo Go on your mobile device automatically connects to.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create account with password strength verification
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve current authenticated user profile *(Protected)*

### Users (`/api/users`)
- `PUT /api/users/:id` — Update profile & stats *(Protected)*
- `PUT /api/users/:id/email` — Update email with password confirmation *(Protected)*
- `PUT /api/users/:id/password` — Change password with current verification *(Protected)*

### Foods (`/api/foods`)
- `POST /api/foods` — Create food item *(Protected)*
- `GET /api/foods/search?q=query` — Search foods by name *(Protected)*
- `GET /api/foods/barcode/:barcode` — Lookup food by barcode *(Protected)*
- `GET /api/foods` — List foods with limit *(Protected)*

### Goals (`/api/goals`)
- `POST /api/goals` — Set / update nutritional macro goal *(Protected)*
- `GET /api/goals?userId=UUID` — List user goals *(Protected)*

### Daily Logs (`/api/daily-logs`)
- `GET /api/daily-logs?userId=UUID&startDate=...&endDate=...` — Query logs in date range *(Protected)*
- `POST /api/daily-logs` — Create day log with foods list & totals *(Protected)*
- `PUT /api/daily-logs/:id` — Update day log *(Protected)*
- `DELETE /api/daily-logs/:id` — Delete day log *(Protected)*

### File Uploads (`/api/upload`)
- `POST /api/upload/avatar` — Upload avatar image *(Protected, max 2MB)*
- `GET /api/uploads/:fileId` — Retrieve uploaded image
- `DELETE /api/uploads/:fileId` — Delete uploaded image *(Protected)*
