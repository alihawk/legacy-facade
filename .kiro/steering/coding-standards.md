# Coding Standards - Legacy UX Reviver

## Spooky Theme Requirements (Analyzer Only)
- **Background:** `bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950`
- **Primary Color:** Green (`text-green-500`, `bg-green-600`)
- **Accents:** Purple, dark slate
- **Icons:** Lucide React (Skull, Ghost for spooky elements)
- **Animations:** `ghost-float` for floating effects

## Modern Theme Requirements (Generated Portal Only)
- **Background:** Light mode (`bg-white`, `bg-gray-50`)
- **Primary Color:** Blue (`bg-blue-600`) or brand color
- **Style:** Clean, professional, modern SaaS aesthetic
- **Components:** shadcn/ui defaults

## TypeScript Rules
- All files use `.tsx` extension
- Strict typing: no `any` without comment explaining why
- Interface names: PascalCase (e.g., `ResourceSchema`, `ResourceField`)
- Props interfaces: `ComponentNameProps`

## React Patterns
- Functional components only (no class components)
- Hooks for state management (`useState`, `useEffect`, `useNavigate`)
- Props destructuring in function signature
- Early returns for loading/error states

## File Organization
```
frontend/src/
├── components/
│   ├── ui/              # shadcn components
│   ├── ResourceList.tsx # Generic list component
│   ├── ResourceDetail.tsx
│   ├── ResourceForm.tsx
│   ├── Sidebar.tsx
│   └── Dashboard.tsx
├── pages/
│   ├── AnalyzerPage.tsx # Spooky theme
│   └── PortalPage.tsx   # Modern theme
└── lib/
    └── utils.ts         # cn() utility
```

## API Client Pattern
```typescript
// Always use axios with try/catch
try {
  const response = await axios.post('http://localhost:8000/api/analyze', data);
  setResources(response.data.resources);
} catch (err) {
  console.error('Backend failed, using fallback', err);
  setResources(buildFallbackResources());
}
```

## Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `use` prefix (e.g., `useResourceData`)
- Utilities: `camelCase`
- CSS classes: Tailwind utilities only