# Netlify Deployment Guide

## Quick Deployment Steps

### 1. Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Git Integration (Recommended)
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub/GitLab account
4. Select your banking system repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

#### Option B: Manual Deploy
```bash
# Build the project locally
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### 3. Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:

```
VITE_API_URL=https://bank-4-yt2f.onrender.com
VITE_APP_NAME=SecureBank
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

### 4. Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Add custom domain
3. Configure DNS settings

## Files Created for Deployment

### `netlify.toml`
- Build configuration
- Redirect rules for SPA routing
- Security headers
- Cache optimization

### `_redirects`
- Fallback routing for React Router
- Ensures all routes work on refresh

### Environment Files
- `.env.example` - Template for environment variables
- `.env.production` - Production environment variables

### Updated Configuration
- `vite.config.js` - Optimized build settings
- `package.json` - Updated scripts and metadata
- `index.html` - SEO and meta tags

## Build Optimization Features

### Code Splitting
- Vendor chunks (React, React DOM)
- Router chunk (React Router DOM)
- Utils chunk (Axios, React Toastify)

### Performance
- Minification with Terser
- Asset optimization
- Cache headers for static assets

### Security Headers
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## Testing Deployment

### Local Preview
```bash
# Build and preview locally
npm run build
npm run preview
```

### Production Testing
1. Test all routes work on refresh
2. Verify API calls work with production backend
3. Check responsive design on different devices
4. Test authentication flow
5. Verify admin panel access control

## Troubleshooting

### Common Issues

**404 on Route Refresh**
- Ensure `_redirects` file is in `public/` directory
- Check `netlify.toml` redirect rules

**Environment Variables Not Working**
- Ensure variables start with `VITE_`
- Check Netlify dashboard environment variables
- Rebuild and redeploy after adding variables

**Build Failures**
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript/ESLint errors

**API Connection Issues**
- Verify CORS settings on backend
- Check API URL in environment variables
- Ensure backend is accessible from Netlify

## Performance Monitoring

### Lighthouse Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### Netlify Analytics
- Enable in Site settings > Analytics
- Monitor page views and performance
- Track user engagement

## Security Considerations

### HTTPS
- Automatic SSL certificate from Netlify
- Force HTTPS redirects

### Content Security Policy
- Consider adding CSP headers for additional security
- Whitelist trusted domains

### Environment Variables
- Never commit `.env` files to repository
- Use Netlify's secure environment variable storage

## Continuous Deployment

### Auto Deploy
- Automatic deployments on git push
- Branch previews for pull requests
- Deploy notifications

### Build Hooks
- Webhook URLs for external triggers
- Scheduled deployments
- Integration with CMS or external services

## Domain and SSL

### Custom Domain Setup
1. Add domain in Netlify dashboard
2. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

### SSL Certificate
- Automatic Let's Encrypt certificate
- Custom certificate upload option
- Force HTTPS redirects

## Monitoring and Maintenance

### Site Health
- Monitor uptime and performance
- Set up status page
- Configure alerts for downtime

### Updates
- Regular dependency updates
- Security patches
- Performance optimizations

Your banking system is now ready for production deployment on Netlify! 🚀