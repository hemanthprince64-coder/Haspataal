# Haspataal Operations Runbook

## Overview
This runbook provides step-by-step procedures for operations staff.

## Table of Contents
1. [Daily Checks](#daily-checks)
2. [Backup Verification](#backup-verification)
3. [Incident Response](#incident-response)
4. [Common Issues](#common-issues)

## Daily Checks

### Health Check
```bash
curl -f https://haspataal.in/api/health
```

Expected: 200 OK

### Database Connectivity
```bash
curl -f https://haspataal.in/api/health/db
```

### Redis Connectivity
```bash
curl -f https://haspataal.in/api/health/redis
```

### Error Rate
Check Grafana dashboard for error rate > 1%.

## Backup Verification

### Verify Backup Completed
```bash
ls -lh backups/
```

### Test Restore (Weekly)
```bash
npx tsx scripts/restore-db.ts backups/backup-latest.sql
```

## Incident Response

### High Error Rate
1. Check Grafana dashboard
2. Check application logs: `docker logs patient-portal --tail 100`
3. Check database connections
4. Restart affected service if needed

### Database Down
1. Check PostgreSQL status
2. If using Supabase, check dashboard
3. Promote read replica if available
4. Update connection string if needed

### Redis Down
1. BullMQ queues will stall
2. Outbox will accumulate events
3. Restart Redis service
4. Verify workers resume

## Common Issues

### Patient Portal Not Loading
1. Check Nginx status
2. Check Next.js build
3. Check environment variables
4. Restart container

### Appointment Not Confirming
1. Check Redis lock status
2. Verify doctor availability
3. Check payment status
4. Review audit log

### SMS/WhatsApp Not Sending
1. Check notification worker logs
2. Verify API credentials
3. Check message queue depth
4. Test with manual trigger
