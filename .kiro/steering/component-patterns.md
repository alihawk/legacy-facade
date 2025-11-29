---
inclusion: fileMatch
fileMatchPattern: "frontend/src/components/**/*.tsx"
---

# Component Patterns

## Component Structure
```tsx
import { useState, useEffect } from 'react';
import type { ComponentProps } from './types';

interface Props {
  // Define props with TypeScript
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

## Best Practices
- Export components as named exports
- Use destructuring for props
- Group related state with objects or useReducer
- Memoize expensive calculations with useMemo
- Use useCallback for functions passed to child components
- Handle loading and error states explicitly

## Accessibility
- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper heading hierarchy
- Test with screen readers
