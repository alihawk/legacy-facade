---
inclusion: manual
---

# Deployment Guide

## Frontend Deployment

### Build Process
```bash
cd frontend
npm run build
```
This creates optimized production files in `frontend/dist/`

### Environment Variables
Create `.env.production` in frontend/:
```
VITE_API_BASE_URL=https://api.production.com
```

### Deployment Targets
- **Static Hosting**: Vercel, Netlify, AWS S3 + CloudFront
- **Container**: Docker with nginx
- **Traditional**: Any web server serving static files

### Pre-deployment Checklist
- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Test production build locally with `npm run preview`
- [ ] Verify environment variables are set
- [ ] Check bundle size (should be < 500KB gzipped)

## Backend Deployment

### Requirements
- Node.js runtime or container platform
- Environment variables configured
- Database connections tested
- API keys secured

### Health Checks
Ensure `/health` endpoint returns 200 OK

## Rollback Plan
- Keep previous build artifacts
- Use version tags in deployment
- Monitor error rates post-deployment
- Have rollback script ready
