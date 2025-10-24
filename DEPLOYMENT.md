# QuickPaySplit - Deployment Guide

## 🚀 Vercel Deployment Fix

### The Problem
Vercel was showing 404 NOT_FOUND error because:
- This is a monorepo with React app in `client/` folder
- Vercel was looking for build output in wrong location
- Static file serving path was incorrect

### The Solution
Fixed `vercel.json` configuration and server static file path for monorepo structure.

## 📋 Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix Vercel deployment for monorepo structure"
git push origin main
```

### 2. Vercel Auto-Deploy
- Vercel will automatically detect the changes
- It will use the new `vercel.json` configuration
- Build process will be: `npm run build`
- Output directory: `dist/public`

### 3. Verify Deployment
After deployment, check:
- ✅ React app loads (not 404 error)
- ✅ API endpoints work (`/api/users`, `/api/balance`, etc.)
- ✅ All features functional

## 🔧 Configuration Files Fixed

### `vercel.json` (Updated)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "framework": null,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/dist/public/assets/$1"
    },
    {
      "src": "/favicon.png",
      "dest": "/dist/public/favicon.png"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/index.html"
    }
  ]
}
```

### `server/vite.ts` (Fixed)
- Updated `serveStatic` function to look in correct path: `../dist/public`
- Fixed static file serving for production

### `.vercelignore`
Excludes unnecessary files from deployment.

## 🎯 Expected Result

After deployment, your app should show:
- ✅ Beautiful React interface (no 404 error)
- ✅ Expense splitting functionality
- ✅ User management
- ✅ Analytics dashboard
- ✅ Theme switching
- ✅ All API endpoints working

## 🚨 If Still Not Working

1. Check Vercel build logs
2. Verify `dist/public` contains built files
3. Ensure all dependencies are installed
4. Check that static files are being served correctly

**The deployment should now work correctly!** 🚀
