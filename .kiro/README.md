# Kiro Configuration for Legacy UX Reviver

This directory contains Kiro AI assistant configurations for the project.

## Structure

### 📋 Specs (`specs/`)
Structured feature specifications with requirements, design, and tasks:
- `api-integration/` - API client and backend integration
- `component-library/` - UI component enhancements

Use specs to plan and implement complex features incrementally.

### 🎯 Steering (`steering/`)
Context and guidelines that influence Kiro's behavior:
- `project-overview.md` - Always included, project architecture
- `coding-standards.md` - Always included, code quality rules
- `component-patterns.md` - Included when editing components
- `deployment.md` - Manual inclusion with #deployment

### 🪝 Hooks (`hooks/`)
Automated workflows triggered by events:
- `lint-on-save.json` - Auto-lint frontend files on save
- `build-check.json` - Manual build verification
- `component-review.json` - AI review of new components (disabled by default)
- `spec-progress.json` - Check spec implementation progress

View and manage hooks in the "Agent Hooks" section of the explorer.

### 🔧 Settings (`settings/`)
Tool configurations:
- `mcp.json` - Model Context Protocol servers for deployment commands

## Getting Started

1. **Working with Specs**: Reference specs in chat with `#Folder` on `.kiro/specs/api-integration`
2. **Using Steering**: Steering docs are auto-included or use `#deployment` for manual ones
3. **Managing Hooks**: Enable/disable in the Agent Hooks UI or edit JSON files directly
4. **MCP Tools**: Deployment commands available via the mcp-server-commands integration

## Quick Commands

Ask Kiro:
- "Show me the API integration spec"
- "Check spec progress" (triggers hook)
- "Review this component" (when component-review hook is enabled)
- "Help me deploy the frontend" (uses deployment steering)
