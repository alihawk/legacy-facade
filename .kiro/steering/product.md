# Product Overview

Legacy UX Reviver is a tool that generates modern UI facades on top of legacy internal APIs. It analyzes OpenAPI specifications and automatically creates a beautiful, functional admin portal without requiring backend changes.

## Core Value Proposition

The Pain Point You're Solving:

- Companies have internal tools from 2010 with terrible UIs
- Backend APIs work fine, but UX makes employees miserable
- Full rewrites cost $100K+ and take months
- Productivity suffers because people hate using the tools

Our Solution:

- Auto-generate modern React frontend from existing APIs
- No backend changes required
- Deploy in days, not months
- Gradual migration path (use new UI while planning backend rewrite)

## Key Features

- OpenAPI spec analyzer that extracts resource schemas
- Auto-generated CRUD interfaces for legacy APIs
- Modern, dark-themed UI with green accent colors (skull/ghost theme)
- Dashboard with resource overview and statistics
- Dynamic routing based on analyzed resources
- Fallback demo mode when backend is unavailable

## User Flow

1. User pastes OpenAPI spec into analyzer page
2. System analyzes spec and extracts resources (or uses fallback)
3. User generates portal which stores schema in localStorage
4. Portal provides full CRUD interface for each discovered resource
