# PM Tool — Basecamp-Inspired Project Management

A clean, minimal internal project management web app built with Next.js 14+. Think Basecamp meets Linear: projects, message boards with threaded replies, and to-do lists — all in a fast, server-rendered interface.

---

## Overview

PM Tool gives your team a shared workspace for each project:

- **Projects** — Create color-coded projects with names and descriptions.
- **Message Board** — Post announcements, proposals, or updates. Team members can reply in threaded comments.
- **To-Dos** — Track tasks with optional assignee names and due dates. Overdue items are highlighted. Toggle completion with a checkbox.
- **Auth** — Email/password sign-up and login. All routes are protected. Passwords are hashed with bcrypt.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL (Neon recommended) |
| ORM | Prisma |
| Auth | NextAuth.js v4 (Credentials) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Deployment | Vercel |

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** (or pnpm / yarn)
- A **PostgreSQL** database — [Neon](https://neon.tech) (free tier) is recommended, or any Postgres instance

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/pm-tool.git
cd pm-tool
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Neon PostgreSQL connection string (use the pooled connection endpoint)
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth secret — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"

# The URL of your app (use http://localhost:3000 for local dev)
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

This creates all tables in your database and generates the Prisma client.

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign up for an account.

---

## Deploying to Vercel

### 1. Connect the GitHub repo

In the [Vercel dashboard](https://vercel.com), click **Add New → Project**, then import your GitHub repository.

### 2. Add environment variables

In the Vercel project settings under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon pooled connection string |
| `NEXTAUTH_SECRET` | A random 32-byte base64 string |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g. `https://pm-tool.vercel.app`) |

### 3. Deploy

Vercel will automatically run `npm run build`, which includes a `postinstall` script that runs `prisma generate`. Your app will be live in seconds.

> **Note:** Run `npx prisma migrate deploy` against your production database once before going live, or use Neon's branching to manage schema changes.

---

## Project Structure

```
pm-tool/
├── prisma/
│   ├── schema.prisma          # Data models (User, Project, Message, Comment, Todo)
│   └── migrations/            # SQL migration history
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth.js handler
│   │   │   ├── projects/      # Project CRUD + nested messages & todos
│   │   │   ├── comments/      # Comment delete endpoint
│   │   │   ├── todos/         # Todo update/delete endpoints
│   │   │   └── signup/        # User registration
│   │   ├── login/             # Login page
│   │   ├── signup/            # Sign-up page
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Project overview
│   │   │       ├── messages/             # Message board & new message
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [msgId]/
│   │   │       │       ├── page.tsx      # Message detail + comments
│   │   │       │       └── edit/         # Edit message
│   │   │       └── todos/page.tsx        # To-do list
│   │   ├── DashboardClient.tsx           # Client wrapper for New Project button
│   │   ├── globals.css
│   │   ├── layout.tsx                    # Root layout with NavBar
│   │   └── page.tsx                      # Dashboard / home
│   ├── components/
│   │   ├── NavBar.tsx                    # Persistent top navigation
│   │   ├── SessionProvider.tsx           # NextAuth session wrapper
│   │   ├── NewProjectModal.tsx           # Create project modal
│   │   ├── TodoList.tsx                  # Interactive to-do list (client)
│   │   ├── CommentForm.tsx               # Reply form (client)
│   │   └── DeleteButton.tsx              # Reusable delete with confirm
│   ├── lib/
│   │   ├── prisma.ts                     # Prisma client singleton
│   │   └── auth.ts                       # NextAuth options
│   ├── middleware.ts                     # Route protection
│   └── types/
│       └── next-auth.d.ts               # Session type augmentation
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## Data Models

| Model | Description |
|---|---|
| `User` | Registered user with hashed password |
| `Project` | Color-coded project workspace |
| `Message` | Post on a project's message board |
| `Comment` | Threaded reply on a message |
| `Todo` | Task item with optional assignee and due date |

---

## License

MIT
