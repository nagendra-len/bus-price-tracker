# Bus Price Tracker Backend - Deployment Guide

## Overview
This guide covers deploying the Bus Price Tracker backend to Render.com, a free tier platform that supports Docker and PostgreSQL.

## Prerequisites
- GitHub account with the bus-price-tracker repository
- Render.com account (https://render.com)
- PostgreSQL database (provided by Render)

## Deployment Steps

### 1. Create Render Account
- Visit https://render.com
- Sign up with your GitHub account
- Grant Render access to your repositories

### 2. Create PostgreSQL Database
1. Go to Dashboard > New +
2. Select "PostgreSQL"
3. Configure:
   - Name: `bus-price-tracker-db`
   - Database: `bus_tracker`
   - User: `tracker_user`
   - Region: Choose closest to your users
4. Click "Create Database"
5. Copy the internal database URL (you'll need this)

### 3. Create Web Service
1. Go to Dashboard > New +
2. Select "Web Service"
3. Connect your GitHub repository (bus-price-tracker)
4. Configure:
   - Name: `bus-price-tracker-api`
   - Region: Same as database
   - Runtime: Node
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables:

NODE_ENV=production
PORT=3000
DB_HOST=<internal_db_url>
DB_PORT=5432
DB_NAME=bus_tracker
DB_USER=tracker_user
DB_PASSWORD=<password_from_db_creation>
JWT_SECRET=your_jwt_secret_key_here
NODE_TLS_REJECT_UNAUTHORIZED=0

### 4. Database Migration
After deployment:
1. Connect to the database using the Render console
2. Run migrations
3. Or execute the schema.sql directly via the Render database console

### 5. Verify Deployment
- Visit your service URL (https://bus-price-tracker-api.onrender.com)
- Test the health endpoint: /api/health
- Check logs in Render dashboard for errors

## Important Notes

### Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- Max 0.5GB RAM
- Limited concurrent connections
- Database: 90 days free, then paid plans

### Production Considerations
- Consider upgrading to paid tier for production
- Set up monitoring and alerts
- Configure automatic deployments from main branch
- Use strong JWT secrets
- Enable HTTPS (automatic on Render)

### Troubleshooting
1. Service won't start: Check build logs and environment variables
2. Database connection error: Verify DB_HOST uses internal URL
3. Port issues: Ensure app listens on process.env.PORT
4. Timeout errors: May indicate insufficient resources

## Local Testing Before Deployment
Test with Docker locally first: docker-compose up
Verify endpoints: curl http://localhost:3000/api/health

## Subsequent Deployments
- Push changes to main branch
- Render automatically redeploys
- Monitor deployment in Render dashboard

## Database Backups
- Use Render's backup feature (paid plans)
- Regularly export data for safety
- Keep version control of schema.sql
