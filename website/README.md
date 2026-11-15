# Vemavaram Village — Smart Complaint Redressal Portal

[![Live Deployment](https://img.shields.io/badge/Vercel-Live_Website-black?logo=vercel)](https://complaintredressalsystem.vercel.app/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

A modern, responsive, citizen-centric digital governance web portal developed for **Vemavaram Village**, Krishna District, Andhra Pradesh. This platform empowers villagers to report community issues directly to the local administration, track status changes in real time, and rate resolutions.

**Live Website**: [https://complaintredressalsystem.vercel.app/](https://complaintredressalsystem.vercel.app/)

---

## 🌟 Key Features

1. **Citizen Authentication & Session Management**:
   - Mobile-based registration and secure login.
   - Persistent JWT sessions with automatic token refresh.

2. **Dedicated Complaint Submission**:
   - Categorized reporting (Water Supply, Road Issues, Sanitation, Drainage, Streetlights, Garbage).
   - Ward selection (Wards 1 to 5) and street location input.
   - Photographic evidence attachment.

3. **Public Status Tracking**:
   - Universal complaint tracking via Complaint ID (e.g., `CMP2026001`).
   - Visual step-based progress tracker (`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved`).

4. **Citizen Dashboard & Feedback**:
   - Personal complaint history with category and status filters.
   - Real-time notification updates when status changes or a field worker is assigned.
   - 1-to-5 star citizen satisfaction rating and remarks upon resolution.

5. **Field Worker Portal Modal**:
   - Dedicated access modal for assigned Vemavaram field staff.
   - On-site progress updates and mandatory resolution photograph evidence submission.

6. **Live Village Statistics**:
   - Dynamic real-time metrics fetched directly from the database (Total Complaints, Resolved, Active Issues, Citizen Satisfaction).

7. **Contact Administration**:
   - Integrated contact form persisting citizen inquiries directly into MySQL.

---

## 🛠️ Technology Stack

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT request/response interceptors
- **Hosting**: Vercel

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
# Clone repository
git clone https://github.com/mahitha32/0-review.git
cd 0-review

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.development` or `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Set the backend API endpoint (pointing to your running Flask API):
```env
VITE_API_URL=http://localhost:5000/api
```

For production builds, set `VITE_API_URL` to your hosted cloud backend URL in Vercel:
```env
VITE_API_URL=https://<your-backend-domain>/api
```

### 4. Running Locally
```bash
# Start Vite development server
npm run dev
```
The website will be available at `http://localhost:5173`.

### 5. Production Build
```bash
# Compile and optimize for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Security Best Practices

- Environment files (`.env`, `.env.development`, `.env.production`) and local credentials are strictly ignored in `.gitignore`.
- Authentication tokens are handled via Bearer headers and validated against the backend JWT signing keys.
- All complaint and resolution image uploads are processed through verified cloud storage.

---

## 📜 Academic Attribution

**Community Service Project (CSP)**  
Department of Computer Science & Engineering  
Seshadri Rao Gudlavalleru Engineering College (SRGEC)  
Krishna District, Andhra Pradesh, India
