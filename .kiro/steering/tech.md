# Tech Stack

## Frontend

- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **Routing**: React Router DOM 7.9
- **Styling**: Tailwind CSS 4.1 with @tailwindcss/vite
- **UI Components**: Custom components built with Radix UI primitives
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Utilities**: clsx, tailwind-merge, class-variance-authority

## Backend

- Placeholder directories exist (`backend/`, `mock-api/`) but not yet implemented
- Frontend expects FastAPI backend at `http://localhost:8000/api/analyze`
- Falls back to local demo resources if backend unavailable

## Common Commands

```bash
# Development
cd frontend
npm run dev          # Start dev server (Vite)

# Build
npm run build        # TypeScript compile + Vite build

# Linting
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## TypeScript Configuration

- `tsconfig.json` - Base config
- `tsconfig.app.json` - App-specific settings
- `tsconfig.node.json` - Node/Vite config
