# Bug Fixes - Proxy Download Feature

## Issues Found During Testing

### Issue 1: Missing Field Mapper Exports ❌ → ✅ FIXED

**Error:**
```
TSError: ⨯ Unable to compile TypeScript:
src/proxy.ts:8:10 - error TS2305: Module '"./fieldMapper"' has no exported member 'mapFieldsToLegacy'.
src/proxy.ts:8:29 - error TS2305: Module '"./fieldMapper"' has no exported member 'mapFieldsFromLegacy'.
```

**Root Cause:**
The `fieldMapperTemplate.ts` was exporting a generic `mapFields()` function, but the proxy router was trying to import `mapFieldsToLegacy()` and `mapFieldsFromLegacy()`.

**Fix Applied:**
Updated `frontend/src/services/templates/proxy/fieldMapperTemplate.ts` to export two separate functions:
- `mapFieldsToLegacy()` - Maps normalized → legacy field names
- `mapFieldsFromLegacy()` - Maps legacy → normalized field names

### Issue 2: Invalid Tailwind @apply Usage ❌ → ✅ FIXED

**Error:**
```
[postcss] The `bg-background` class does not exist. If `bg-background` is a custom class, 
make sure it is defined within a `@layer` directive.
```

**Root Cause:**
The `index.css` template was using `@apply bg-background text-foreground` which doesn't work with Tailwind v4. The `@apply` directive can't be used with custom utilities that reference CSS variables.

**Fix Applied:**
Updated `frontend/src/services/templates/baseTemplates.ts` to use direct CSS instead of `@apply`:
```css
@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
```

## How to Test the Fixes

### Option 1: Re-download the Project

1. Go back to your browser at http://localhost:5173
2. Click "Download Project" again
3. Extract the new ZIP file
4. Run `./start.sh`

### Option 2: Manual Fix in Downloaded Project

If you want to fix the current downloaded project without re-downloading:

**Fix 1: Update fieldMapper.ts**

Edit `proxy-server/src/fieldMapper.ts` and change:

```typescript
// OLD:
export function mapFields(
  data: Record<string, any> | Record<string, any>[],
  mappings: FieldMapping[],
  toLegacy: boolean = false
)

// NEW: Split into two functions
export function mapFieldsToLegacy(
  data: Record<string, any> | Record<string, any>[],
  mappings: FieldMapping[]
): Record<string, any> | Record<string, any>[] {
  if (!mappings || mappings.length === 0) {
    return data;
  }
  const map = new Map<string, string>();
  for (const m of mappings) {
    map.set(m.normalizedName, m.legacyName);
  }
  if (Array.isArray(data)) {
    return data.map(item => mapSingleRecord(item, map));
  }
  return mapSingleRecord(data, map);
}

export function mapFieldsFromLegacy(
  data: Record<string, any> | Record<string, any>[],
  mappings: FieldMapping[]
): Record<string, any> | Record<string, any>[] {
  if (!mappings || mappings.length === 0) {
    return data;
  }
  const map = new Map<string, string>();
  for (const m of mappings) {
    map.set(m.legacyName, m.normalizedName);
  }
  if (Array.isArray(data)) {
    return data.map(item => mapSingleRecord(item, map));
  }
  return mapSingleRecord(data, map);
}
```

**Fix 2: Update index.css**

Edit `frontend/src/index.css` and change:

```css
/* OLD: */
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* NEW: */
@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
```

**Note:** The `@apply` directive doesn't work with custom utilities in Tailwind v4, so we use direct CSS properties instead.

Then run `./start.sh` again.

## Expected Result After Fixes

```
=== Admin Portal Startup ===

Starting proxy server...
✓ Configuration loaded successfully
  API Type: rest
  Base URL: https://jsonplaceholder.typicode.com
  Resources: 1

🚀 Proxy server running on http://localhost:4000
   Health check: http://localhost:4000/health
   Proxy endpoint: http://localhost:4000/proxy

Starting frontend...
VITE v7.2.6  ready in 294 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Both servers should start successfully with no errors!

## Status

✅ **Both issues fixed in source code**
✅ **Ready for re-download and testing**

Next download will include these fixes automatically.
