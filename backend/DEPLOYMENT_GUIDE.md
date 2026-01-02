# Deployment Guide - Bus Price Tracker Backend

## Overview

This guide covers deployment and local development setup for the Bus Price Tracker backend using Docker and Docker Compose.

## Local Development Setup

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v1.29+)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/nagendra-len/bus-price-tracker.git
cd bus-price-tracker/backend
```

2. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- API server (port 5000)

3. **View logs**
```bash
docker-compose logs -f app
```

4. **Access the application**
```
http://localhost:5000
```

### Development Workflow

**Run tests**
```bash
docker-compose exec app npm test
```

**Run with coverage**
```bash
docker-compose exec app npm test -- --coverage
```

**Build TypeScript**
```bash
docker-compose exec app npm run build
```

**View database**
```bash
docker-compose exec db psql -U bus_user -d bus_tracker_db
```

### Stopping Services

```bash
# Stop all services
docker-compose stop

# Remove all containers
docker-compose down

# Remove with volumes (WARNING: deletes data)
docker-compose down -v
```

## Production Deployment

### Using Docker

**Build image**
```bash
docker build -t bus-price-tracker:latest .
```

**Run container**
```bash
docker run -d \
  --name bus-tracker \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your_secret_key \
  bus-price-tracker:latest
```

### Environment Variables

Create `.env` file in backend directory:

```env
# Application
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@postgres-host:5432/bus_tracker_db

# Authentication
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=7d

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE=+1234567890

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

## Deployment Platforms

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create bus-price-tracker

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS EC2

```bash
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker

# Pull and run
docker pull your-registry/bus-price-tracker
docker run -d -p 5000:5000 --env-file .env your-registry/bus-price-tracker
```

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Configure health check: `GET /health` on port 5000
4. Deploy

## Database Migrations

### Initial Setup

The database schema is automatically initialized from `schema.sql` when PostgreSQL starts in Docker.

### Manual Migration

```bash
# Connect to database
docker-compose exec db psql -U bus_user -d bus_tracker_db

# Run migration script
\i /docker-entrypoint-initdb.d/schema.sql
```

## Monitoring

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T17:00:00Z"
}
```

### Log Levels

- `error`: Errors and exceptions
- `warn`: Warnings
- `info`: General information
- `debug`: Detailed debugging

### Performance Monitoring

The application includes:
- Request logging
- Database query logging
- Error tracking
- Performance metrics

## Troubleshooting

### Connection Refused

```bash
# Check if services are running
docker-compose ps

# Restart services
docker-compose restart
```

### Database Connection Error

```bash
# Check database logs
docker-compose logs db

# Verify credentials in .env
```

### Port Already in Use

```bash
# Change port mapping in docker-compose.yml
# Or kill existing process
sudo lsof -i :5000
sudo kill -9 <PID>
```

## Scaling

### Horizontal Scaling

Use Kubernetes or Docker Swarm:

```bash
# Docker Swarm
docker service create --replicas 3 bus-price-tracker
```

### Database Optimization

- Add connection pooling (PgBouncer)
- Enable read replicas
- Configure indexes
- Archive old data

## Security Checklist

- [ ] Change default database passwords
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Set up monitoring alerts
- [ ] Regular security updates
- [ ] API rate limiting
- [ ] Input validation

## Backup & Recovery

### Database Backup

```bash
# Backup
docker-compose exec db pg_dump -U bus_user bus_tracker_db > backup.sql

# Restore
cat backup.sql | docker-compose exec -T db psql -U bus_user -d bus_tracker_db
```

### Volume Backup

```bash
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/postgres_backup.tar.gz /data
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs app`
2. Review this guide
3. Check GitHub issues
4. Contact development team
