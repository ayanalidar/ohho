# OHHO BURGERS — GitHub Repository

**Live repo:** https://github.com/ayanalidar/ohho

## Local Development

```bash
# Clone
git clone https://github.com/ayanalidar/ohho.git
cd ohho

# Install dependencies
bun install

# Set up the database
bun run db:push

# Seed the database (creates admin + demo users + menu items)
# Visit http://localhost:3000/api/seed in your browser

# Start the dev server
bun run dev
```

## Demo Credentials
- **Admin:** admin@ohhofoods.com / admin123
- **Customer:** demo@ohhofoods.com / demo123
- **Operator:** kairana@ohhofoods.com / operator123

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM (SQLite)
- Three.js / React Three Fiber (3D tour)
- Framer Motion (animations)
- Socket.io (real-time order sync)
- Zustand (cart state)
- PWA (installable, offline menu)

## Made & maintained by: GuardianX
