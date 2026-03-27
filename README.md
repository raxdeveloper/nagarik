# NAGRIKA (नागरिक) — Nepal's Problem City

A production-ready, citizen-driven platform to report and track civic problems across all 7 provinces and 77 districts of Nepal.

![Nagrika Banner](https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop)

## 🚀 Features

- **Realtime Reporting**: Problems appear instantly on the map without refreshing.
- **Exact Nepal Map**: Leaflet integration with precise province and district GeoJSON boundaries.
- **Multi-step Verification**: 4-step report flow with location pinning, categorized issues, severity slider, and image uploads.
- **Nagrika Score**: Gamified citizen engagement — earn points for reporting and upvoting.
- **Live Dashboard**: Interactive Recharts visualizations of platform statistics and trends.
- **Realtime Comments & Upvotes**: Discuss civic issues live.
- **Admin Panel**: Role-based access control to verify, reject, and update progress of reported issues.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Shadcn UI
- **State Management**: Zustand
- **Map**: React Leaflet v4, Custom GeoJSON
- **Backend / DB**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Charts**: Recharts

## 📦 Local Setup

1. **Clone and Install**
```bash
git clone https://github.com/yourusername/nagrika.git
cd nagrika
npm install --legacy-peer-deps
```

2. **Environment Variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Supabase Setup**
- Create a new project on [Supabase](https://supabase.com).
- Go to the SQL Editor and copy-paste the contents of `supabase/migrations/01_setup.sql`.
- Run the script to instantly create all tables, ENUMs, RLS policies, realtime triggers, storage buckets, and seed data.
- Ensure Auth providers (Email/Password, Phone) are enabled in Supabase settings.

4. **GeoJSON Data**
Download the exact Nepal GeoJSON data (provinces and districts) and place them in the `/public/data/` folder:
- `/public/data/nepal-provinces.geojson`
- `/public/data/nepal-districts.geojson`

5. **Run the App**
```bash
npm run dev
```
Visit `http://localhost:3000`.

## 🌍 Design System

The application strictly adheres to the "Linear-quality" glassmorphic design system:
- **Backgrounds**: Deep space black (`#05050a`), subtle grid patterns, glass panels.
- **Typography**: Space Grotesk (Headings) + Inter (Body).
- **Accents**: Nepal Red (`#DC143C`) and Nepal Blue (`#003893`).
- **Animations**: Smooth Framer Motion transitions, spring physics, and CSS micro-interactions.

## 🚀 Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fnagrika&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

1. Push your code to GitHub.
2. Connect the repository to Vercel.
3. Add the Supabase environment variables in Vercel project settings.
4. Deploy!

## 📄 License & Open Source

This project is built for the citizens of Nepal. Open sourced under the MIT License.
