<div align="center">

# 🚀 TaskFlow AI

### AI-Powered Daily Task Scheduler

An intelligent task organizer powered by AI — manages your time and prioritizes your work automatically.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📖 About the Project

**TaskFlow AI** is a web application designed to help you organize your day automatically. Instead of managing tasks manually, simply tell the app what you need to do in natural language — Arabic or English — and the AI will:

- ✅ Extract the task title automatically
- ⏱️ Estimate the expected duration
- 🔥 Determine priority based on context
- 📅 Schedule it in your calendar

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **Natural Language Input** | Type "Meeting tomorrow at 10 AM" and the AI will understand it |
| 🎯 **Smart Prioritization** | Tasks are automatically ranked by importance |
| 📅 **Interactive Calendar** | View tasks grouped by date |
| 🌐 **Bilingual Support** | Full interface in Arabic (RTL) and English (LTR) |
| 🔐 **Secure Authentication** | Sign in via Supabase Auth |
| 📱 **Responsive Design** | Works on mobile, tablet, and desktop |
| 🎨 **Modern UI** | Elegant dark theme with Framer Motion animations |

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology |
|----------|------------|
| **Frontend** | React 19 · TypeScript 5.7 · Tailwind CSS 4 |
| **Build Tool** | Vite 8 |
| **Routing** | React Router 7 |
| **State** | React Hooks · Context API |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **AI** | DeepSeek API |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js **22+**
- pnpm **10+**
- A [Supabase](https://supabase.com) account
- An API key from [DeepSeek](https://platform.deepseek.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Abdallahmoha277/AI-PoweredDailyTaskScheduler.git
cd AI-PoweredDailyTaskScheduler

# 2. Install dependencies
pnpm install

# 3. Copy the environment variables file
cp .env.example .env

# 4. Edit .env and add your Supabase credentials

# 5. Start the development server
pnpm dev
```

The app will run on `http://localhost:5173`

---

## 🗄️ Database Setup

Open [Supabase SQL Editor](https://supabase.com/dashboard) in your project and paste the contents of `supabase/schema.sql`:

```bash
# The file is located in the repository at:
supabase/schema.sql
```

This file will:
- Create the `tasks` table with all required columns
- Enable Row Level Security (RLS)
- Create the four security policies
- Add necessary indexes for performance

---

## 🤖 AI Setup

### 1. Get a DeepSeek API Key

Go to [DeepSeek Platform](https://platform.deepseek.com/) → API Keys → Create a new key.

### 2. Add the Key to Supabase Secrets

```bash
supabase secrets set DEEPSEEK_API_KEY=sk-your-key-here
```

### 3. Deploy the Edge Function

```bash
supabase functions deploy server
```

The "AI Assistant" feature is now ready to use.

---

## 📁 Project Structure

```
AI-PoweredDailyTaskScheduler/
│
├── src/
│   ├── components/
│   │   ├── AddTaskModal.tsx      # Manual task creation modal
│   │   └── Layout.tsx            # Shared layout (Sidebar + Header)
│   │
│   ├── lib/
│   │   ├── language.tsx          # Translation system (Arabic/English)
│   │   └── supabase.ts           # Supabase client initialization
│   │
│   ├── pages/
│   │   ├── Landing.tsx           # Landing page
│   │   ├── Auth.tsx              # Sign in / Sign up
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Calendar.tsx          # Calendar view
│   │   ├── Assistant.tsx         # AI chat assistant
│   │   └── Settings.tsx          # User settings
│   │
│   ├── App.tsx                   # Main router
│   ├── ErrorBoundary.tsx         # Error boundary
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles + theme
│
├── supabase/
│   ├── functions/
│   │   └── server/
│   │       └── index.ts          # AI Edge Function
│   └── schema.sql                # Database schema
│
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public (anon) key | `eyJhbGci...` |

> ⚠️ **Warning**: Never put the `service_role` key in the frontend. Use only the `anon key`.

---

## 🎯 How to Use

### 1. Create an Account
Go to `/auth` → Sign up → enter your email and password.

### 2. Add a Task Manually
Click the `+ Add Task` button on the dashboard → fill in the details.

### 3. Or Use the AI
In the "AI Assistant" field at the bottom of the dashboard, type for example:
```
Meeting with the team tomorrow at 10 AM
```
or
```
Urgent: prepare presentation for 2 hours tomorrow
```

### 4. Check the Calendar
Open `/calendar` to see tasks grouped by date.

### 5. Try the Full Chat
Open `/assistant` for a full conversation with the AI.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the project
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Made with ❤️ by [Abdallah Mohammed](https://github.com/Abdallahmoha277)**

⭐ If you like this project, don't forget to star it!

</div>
