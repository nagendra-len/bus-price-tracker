# Bus Price Tracker - Render.com Deployment Setup Guide

## Quick Start - Step by Step

This guide will walk you through deploying the Bus Price Tracker backend to Render.com.

### Step 1: Create Render Account

1. Visit https://render.com
2. Click "Get Started"
3. Sign up with GitHub account
4. Authorize Render to access your GitHub repositories
5. Verify your email address

### Step 2: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click "New +" button at top right
3. Select "PostgreSQL"
4. Fill in the form:
   - Name: bus-price-tracker-db
   - Database: bus_tracker
   - User: tracker_user
   - Password: Create a strong password and save it
   - Region: Choose region closest to your users (Asia)
   - Plan: Free tier for development
5. Click "Create Database"
6. Wait 2-3 minutes for database to be ready
7. Copy the Internal Database URL

### Step 3: Create Web Service

1. Go to Render Dashboard
2. Click "New +" button
3. Select "Web Service"
4. Connect your GitHub repository:
   - Search for bus-price-tracker
   - Select it and click Connect
5. Configure:
   - Name: bus-price-tracker-api
   - Region: Same as database
   - Branch: main
   - Runtime: Node
   - Build Command: npm ci && npm run build
   - Start Command: npm start
6. Click "Create Web Service"

### Step 4: Add Environment Variables

In Render dashboard, go to Web Service > Environment.

Add these variables:
```
NODE_ENV=production
PORT=3000
DB_HOST=dpg-xxxxx.internal
DB_PORT=5432
DB_NAME=bus_tracker
DB_USER=tracker_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_TLS_REJECT_UNAUTHORIZED=0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
```

### Step 5: Database Schema Setup

After service deploys:

1. Go to PostgreSQL database in Render Dashboard
2. Click Connection tab
3. Click PSQL to open console
4. Copy schema.sql contents from backend/src/database/
5. Execute the SQL commands

### Step 6: Verify Deployment

1. Wait for Deploy status to turn green
2. Note your service URL
3. Test: https://bus-price-tracker-api.onrender.com/api/health
4. Check logs in Render dashboard

### Step 7: Test Endpoints

Test these after deployment:
```
# Health
curl https://bus-price-tracker-api.onrender.com/api/health

# Auth
curl -X POST https://bus-price-tracker-api.onrender.com/api/auth/register

# Buses
curl https://bus-price-tracker-api.onrender.com/api/buses?from=Hyderabad
```

## Troubleshooting

### Service won't start
- Check Logs tab in dashboard
- Verify all environment variables are set
- Ensure Build Command is correct

### Database connection error
- Verify DB_HOST uses INTERNAL URL
- Check database password is correct
- Ensure DB_NAME matches

### CORS errors
- Add frontend URL to CORS_ORIGIN environment variable

### Service spins down
- This is normal on free tier after 15 minutes
- Upgrade to paid plan for production

## Important Notes

### Free Tier Limits
- Service spins down after 15 minutes of inactivity
- 0.5 GB RAM limit
- Limited concurrent database connections (10)
- PostgreSQL free tier: 90 days

### Security Checklist
- [ ] Change JWT_SECRET to a secure value
- [ ] Use strong database password (16+ characters)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up CORS properly
- [ ] Don't commit secrets to GitHub

## Next Steps

1. Deploy frontend to compatible platform
2. Update frontend API URL
3. Test full integration
4. Set up real-time data aggregation from bus operators
5. Upgrade to paid tier for production

## Subsequent Deployments

After initial setup:
1. Make changes to code
2. Commit and push to main
3. Render automatically redeploys
4. Check deployment status in dashboard

## Support

For issues:
1. Check Render status page
2. Review Render documentation: https://render.com/docs
3. Check application logs in Render dashboard
4. Test locally with Docker: docker-compose up
