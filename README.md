# PayTrack 🚀

Dashboard de suivi de bulletins de paie avec gamification.

## Stack
- **Next.js 15** — framework React
- **Supabase** — auth + base de données + storage
- **Tailwind CSS** — styles
- **shadcn/ui** — composants UI
- **Recharts** — graphiques

## Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer Supabase
Le fichier `.env.local` est déjà configuré avec tes credentials.

### 3. Créer les tables Supabase
- Va sur [supabase.com](https://supabase.com) → ton projet
- **SQL Editor** → **New query**
- Copie-colle le contenu de `supabase/migrations/001_init.sql`
- Clique **Run**

### 4. Lancer le projet
```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) 🎉

## Structure
```
paytrack/
├── app/
│   ├── auth/page.tsx          # Connexion / inscription
│   ├── dashboard/page.tsx     # Dashboard principal
│   └── globals.css
├── components/
│   ├── ui/                    # Composants génériques
│   └── dashboard/             # Composants métier
├── hooks/
│   ├── usePayslips.ts
│   └── useGoals.ts
├── utils/
│   └── salary.ts              # Logique métier partagée
└── supabase/
    └── migrations/001_init.sql
```
