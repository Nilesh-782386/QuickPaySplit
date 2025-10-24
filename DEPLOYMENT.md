# QuickPaySplit - Deployment Guide

## 🚀 Vercel Deployment Fix

### The Problem
Vercel was serving raw source code instead of the built React application.

### The Solution
Added proper `vercel.json` configuration to handle full-stack deployment.

## 📋 Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### 2. Vercel Auto-Deploy
- Vercel will automatically detect the changes
- It will use the new `vercel.json` configuration
- Build process will be: `npm run build`
- Output directory: `dist/public`

### 3. Verify Deployment
After deployment, check:
- ✅ React app loads (not source code)
- ✅ API endpoints work (`/api/users`, `/api/balance`, etc.)
- ✅ All features functional

## 🔧 Configuration Files Added

### `vercel.json`
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
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### `.vercelignore`
Excludes unnecessary files from deployment.

## 🎯 Expected Result

After deployment, your app should show:
- ✅ Beautiful React interface
- ✅ Expense splitting functionality
- ✅ User management
- ✅ Analytics dashboard
- ✅ Theme switching
- ✅ All API endpoints working

## 🚨 If Still Not Working

1. Check Vercel build logs
2. Verify `dist/public` contains built files
3. Ensure all dependencies are installed
4. Check environment variables if needed

**The deployment should now work correctly!** 🚀
