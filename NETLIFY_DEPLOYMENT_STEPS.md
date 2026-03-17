# Netlify Deployment - Step by Step Guide

## Issue: "We're having trouble connecting you to Netlify"

This error is commonly caused by:
- Ad blockers (uBlock Origin, AdBlock Plus)
- Browser extensions
- Corporate firewalls
- VPN connections

## Solutions:

### Option 1: Fix Browser Connection Issues

1. **Disable Ad Blockers**
   - Temporarily disable all ad blockers
   - Add `netlify.com` to whitelist
   - Try in incognito/private mode

2. **Clear Browser Data**
   ```
   - Clear cookies and cache
   - Disable browser extensions
   - Try different browser (Chrome, Firefox, Edge)
   ```

3. **Network Issues**
   - Disable VPN temporarily
   - Try different network connection
   - Check if corporate firewall blocks Netlify

### Option 2: Deploy via Netlify CLI (Recommended)

Since you already pushed to GitHub, use Netlify CLI:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Navigate to your project
cd bank

# Build your project
npm run build

# Login to Netlify (this will open browser)
netlify login

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Option 3: Manual Deployment Steps

If browser issues persist, follow these steps:

#### Step 1: Build Your Project Locally
```bash
cd bank
npm run build
```

#### Step 2: Create Netlify Account
- Go to https://netlify.com using different browser/network
- Sign up with GitHub account
- Verify email if required

#### Step 3: Deploy via Drag & Drop
1. Go to Netlify dashboard
2. Drag your `dist` folder to the deploy area
3. Your site will be deployed instantly

#### Step 4: Connect to GitHub (Later)
1. Once deployed, go to Site Settings
2. Build & Deploy → Continuous Deployment
3. Connect to GitHub repository: `erniranjank15/Bank-Frontend`

## Environment Variables Setup

After deployment, add these environment variables:

### In Netlify Dashboard:
1. Go to Site Settings → Environment Variables
2. Add these variables:

```
VITE_API_URL=https://bank-4-yt2f.onrender.com
VITE_APP_NAME=SecureBank
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

## Alternative: Deploy via GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: https://bank-4-yt2f.onrender.com
          VITE_APP_NAME: SecureBank
          VITE_NODE_ENV: production
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Quick CLI Deployment Commands

```bash
# One-time setup
npm install -g netlify-cli
cd bank
npm run build

# Deploy (first time)
netlify deploy --dir=dist

# Deploy to production
netlify deploy --prod --dir=dist

# Check deployment status
netlify status

# Open deployed site
netlify open
```

## Troubleshooting Common Issues

### Build Fails
```bash
# Check for errors
npm run build

# Fix common issues
npm install
npm run lint
```

### Environment Variables Not Working
```bash
# Check if variables are set
netlify env:list

# Set variables via CLI
netlify env:set VITE_API_URL https://bank-4-yt2f.onrender.com
```

### Site Not Loading
1. Check `_redirects` file exists in `public/` folder
2. Verify `netlify.toml` configuration
3. Check browser console for errors

## Success Checklist

- [ ] Build completes without errors (`npm run build`)
- [ ] Environment variables configured
- [ ] Site deploys successfully
- [ ] All routes work (no 404 on refresh)
- [ ] API calls work correctly
- [ ] Authentication flow works
- [ ] Mobile responsive

## Your Repository Details

- **GitHub**: https://github.com/erniranjank15/Bank-Frontend
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18

## Need Help?

If you're still having issues:
1. Try Netlify CLI method (most reliable)
2. Use different browser/network
3. Contact me for alternative deployment options

Your banking system is ready for deployment! 🚀