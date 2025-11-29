#!/usr/bin/env bash
set -e

echo "🚀 Deploying Legacy UX Reviver to Vercel..."

cd frontend
npm install
npm run build
npx vercel --prod --yes

echo "✅ Deployment complete!"