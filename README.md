# SCRBRD Beta 2

A comprehensive sports management and scoring platform built with Next.js, Firebase, and Shadcn UI.

## Overview

SCRBRD is designed to manage all aspects of a sports organization, from player rosters and match scoring to financial tracking and logistics. It features a modern, responsive UI and a robust set of tools for coaches, administrators, and players.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Backend**: [Firebase](https://firebase.google.com/)
  - Firestore (Database)
  - Firebase Authentication
  - Firebase Admin SDK
- **Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **State Management**: React Context & Hooks
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) (Toast notifications)

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/iamkameel/scrbrd-beta-2.git
   cd scrbrd-beta-2
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Copy `.env.example` to `.env.local` and add your Firebase credentials:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   
   # Firebase Admin SDK (for server-side operations)
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

### Core Management

- **Dashboard**: Real-time overview of matches, players, and key metrics with role-based views
- **Player Management**: Detailed profiles, skill ratings (radar charts), and performance history
- **Team Management**: Roster management, season planning, and division tracking
- **Match Center**: Live scoring, ball-by-ball tracking, and detailed analytics

### Analytics & Visualization

- **Wagon Wheel**: Shot placement visualization
- **Manhattan Chart**: Run scoring patterns
- **Worm Chart**: Match progression comparison
- **Form Guide Sparklines**: Performance trends

### Operations

- **Logistics**: Transport and equipment management
- **Financials**: Transaction tracking, sponsorship management, and billing
- **Field Management**: Venue booking, capacity management, and maintenance scheduling

### Governance & Admin

- **User Management**: Role-based access control with granular permissions
- **Digital Rulebook**: Rule management and display
- **Strategic Calendar**: Season and event planning
- **Audit Log**: Activity tracking

### Advanced Features

- **AI Scouting**: Player comparison and potential analysis
- **Umpire Review**: DRS simulation with ball tracking and UltraEdge
- **Data Management**: Export data and migrate sample data to Firestore

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server actions for data mutations
│   ├── home/              # Dashboard views
│   ├── matches/           # Match management
│   ├── players/           # Player management
│   ├── teams/             # Team management
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI primitives
│   ├── charts/           # Data visualizations
│   ├── layout/           # App layout (Sidebar, Header)
│   ├── dashboard/        # Role-based dashboards
│   └── [feature]/        # Feature-specific components
├── contexts/             # React Context providers
│   └── AuthContext.tsx   # Firebase auth provider
├── lib/                  # Utilities and services
│   ├── firebase.ts       # Firebase client config
│   ├── firebase-admin.ts # Firebase Admin SDK
│   ├── firestore.ts      # Firestore data operations
│   ├── actions/          # Server action modules
│   └── validations/      # Zod schemas
└── types/                # TypeScript type definitions
    └── firestore.ts      # Firestore document types
```

## Authentication & Roles

SCRBRD implements role-based access control with the following role categories:

- **Administrative**: Super Admin, System Admin, School Admin
- **School Staff**: Headmaster, Sports Director, Head of Department
- **Coaching**: Director of Cricket, Head Coach, Assistant Coach
- **Medical**: Doctor, Physiotherapist, Trainer
- **Operations**: Groundskeeper, Transport Coordinator, Equipment Manager
- **Governance**: Umpire, Scorer, Statistician
- **Financial**: Financial Manager

## Firebase Setup

### Required Firestore Collections

- `people` - Player and staff profiles
- `teams` - Team data
- `matches` - Match records
- `schools` - School information
- `fields` - Venue/field data
- `equipment` - Equipment inventory
- `transactions` - Financial records
- `sponsors` - Sponsorship data
- `seasons` - Season configurations
- `divisions` - League divisions
- `leagues` - League data

### Composite Indexes

For optimal query performance, create these composite indexes:

1. **Top Run Scorers**: Collection `people`, Fields: `role` (Asc), `stats.totalRuns` (Desc)
2. **Top Wicket Takers**: Collection `people`, Fields: `role` (Asc), `stats.wicketsTaken` (Desc)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
