# Nexus Trading Hub

A professional all-in-one web dashboard for traders, built with Next.js 14+, Supabase, and Tailwind CSS.

## ✨ Features

- **🔐 Authentication** - Secure login with email/password and OAuth (Google, GitHub)
- **📊 Risk Calculator** - Calculate position sizes for forex, indices, commodities, and crypto
- **📝 Trading Journal** - Dual-mode entries (Simple reflections & Technical trade logs)
- **📈 Analytics** - Track win rate, profit factor, streaks, and performance metrics
- **📰 Market News** - Stay updated with real-time market news
- **🎨 Premium Design** - Refined dark glassmorphism aesthetic

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies:**
   ```bash
   cd nexus-app
   npm install
   ```

2. **Configure environment variables:**
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Set up the database:**
   
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Run the contents of `supabase/schema.sql`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
nexus-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/              # Login page
│   │   ├── auth/callback/      # OAuth callback
│   │   ├── journal/            # Trading journal
│   │   ├── analytics/          # Performance analytics
│   │   ├── calculator/         # Risk calculator
│   │   ├── settings/           # User settings
│   │   └── page.tsx            # Dashboard
│   ├── components/
│   │   ├── layout/             # Sidebar, Header
│   │   ├── dashboard/          # News, Calculator widgets
│   │   ├── journal/            # Entry editor, list
│   │   └── analytics/          # Stats cards
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   ├── analytics.ts        # Stats calculations
│   │   └── riskCalculator.ts   # Position sizing logic
│   └── types/
│       └── database.types.ts   # TypeScript definitions
├── supabase/
│   └── schema.sql              # Database schema
└── .env.local                  # Environment variables
```

## 🔧 Supabase Setup

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the Database Schema

In your Supabase dashboard:
1. Go to **SQL Editor**
2. Click **New Query**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

### 3. Enable OAuth Providers (Optional)

To enable Google/GitHub login:
1. Go to **Authentication** → **Providers**
2. Enable Google and/or GitHub
3. Add your OAuth credentials

### 4. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the **Project URL** and **anon public** key
3. Add them to your `.env.local` file

## 🎨 Design System

The app uses a custom design system with:

- **Colors:** Refined dark palette with cyan, emerald, crimson, and amber accents
- **Typography:** Space Grotesk (display) + JetBrains Mono (numbers)
- **Effects:** Glassmorphism, gradient meshes, subtle animations
- **Components:** Glass cards, premium buttons, animated stats

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🛡️ Security

- Row Level Security (RLS) ensures users can only access their own data
- All database operations are authenticated
- Sensitive operations are handled server-side

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for traders who want to level up their game.
