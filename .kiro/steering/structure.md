# Project Structure

## Root Layout

```
/
├── frontend/          # React + Vite application
├── backend/           # Backend placeholder (not implemented)
├── mock-api/          # Mock API placeholder (not implemented)
└── .kiro/             # Kiro configuration and steering
```

## Frontend Structure

```
frontend/
├── src/
│   ├── pages/              # Route-level components
│   │   ├── AnalyzerPage.tsx    # OpenAPI spec analyzer
│   │   └── PortalPage.tsx      # Main portal with routing logic
│   ├── components/         # Reusable components
│   │   ├── Dashboard.tsx       # Resource overview dashboard
│   │   ├── ResourceList.tsx    # List view for resources
│   │   ├── ResourceDetail.tsx  # Detail view for single record
│   │   ├── ResourceForm.tsx    # Create/edit forms
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── LoadingState.tsx    # Loading indicators
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn helper)
│   ├── App.tsx             # Root component with routing
│   └── main.tsx            # Entry point
├── public/             # Static assets
└── [config files]      # Vite, TypeScript, ESLint configs
```

## Architecture Patterns

- **Pages**: Handle routing, state management, and data fetching
- **Components**: Presentational components that receive props
- **UI Components**: Atomic design system components in `components/ui/`
- **State Management**: React hooks (useState, useEffect) + localStorage for schema persistence
- **Routing**: File-based mental model with dynamic params (`/portal/:resource/:id`)
- **Styling**: Utility-first with Tailwind, dark theme with slate/green palette
- **Type Safety**: TypeScript interfaces defined inline in components
