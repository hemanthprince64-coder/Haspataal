# Failure Recovery Playbook

This Standard Operating Procedure (SOP) details the immediate actions, symptoms, and escalation paths for common production failures at the Muzaffarpur hospital pilot.

---

## 1. Database Unavailable

**Symptoms:**
- The application shows a blank white page or a 500 Error Boundary screen.
- API requests consistently time out or return `503 Service Unavailable`.
- PM2/Docker logs show `PrismaClientInitializationError` or `Connection refused`.

**Immediate Operator Actions:**
1. Check the PostgreSQL container status: `docker ps | grep postgres`.
2. If down, restart it: `docker-compose restart db`.
3. Verify disk space (see Disk Full below).
4. Verify memory usage: `free -m`. If memory is exhausted, restart the entire stack.

**Escalation Path:**
- If the database fails to restart within 5 minutes, escalate to Lead Engineer.
- Fallback: Instruct reception staff to use emergency paper registration forms (kept at desk).

**Expected Recovery Time:** < 10 minutes for simple crashes.

---

## 2. Disk Full (No Space Left on Device)

**Symptoms:**
- Database transactions fail with `could not write to file`.
- Next.js throws `ENOSPC` errors in the logs.
- New patient registrations silently fail to save.

**Temporary Mitigation & Cleanup:**
1. Check disk space: `df -h`.
2. Clear old Docker images/volumes: `docker system prune -af --volumes` (Be careful to exclude active volumes).
3. Clear old Nginx access logs: `truncate -s 0 /var/log/nginx/access.log`.
4. Delete old backup files in `./backups` older than 7 days.

**Escalation Path:**
- Escalate to DevOps to expand the VPS block storage volume if usage > 90% is legitimate data.

---

## 3. TLS Certificate Expiration

**Symptoms:**
- Users see a "Your connection is not private" or `NET::ERR_CERT_DATE_INVALID` error in the browser.
- The web app is completely inaccessible.

**Detection & Renewal:**
1. Check certificate expiry: `curl -vI https://muzaffarpur.haspataal.com 2>&1 | grep "expire date"`.
2. Force renew via Certbot: `certbot renew --force-renewal`.
3. Reload Nginx: `docker-compose restart nginx` or `nginx -s reload`.

**Escalation Path:**
- Immediate escalation to IT Admin to fix domain validation issues if renewal fails.

---

## 4. High CPU / Memory Spikes

**Symptoms:**
- The application is extremely sluggish (Search takes > 5 seconds).
- SSH to the VPS is slow or unresponsive.
- `htop` shows CPU at 100% or Memory entirely in Swap.

**Procedures:**
1. Inspect logs to find the culprit (e.g., recursive API loops or DDOS): `docker-compose logs --tail 100 app`.
2. If the issue is a rogue process, restart the Next.js container: `docker-compose restart app`.
3. Check Nginx logs for unusual IP traffic: `tail -n 1000 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -n 10`.

**Escalation Path:**
- Escalate to Lead Engineer to analyze code performance or implement Nginx-level IP bans/rate-limiting.

---

## 5. Network / Internet Down (Hospital Side)

**Symptoms:**
- The hospital's local network loses connection to the VPS.
- Staff complain "The software is not loading".

**Procedures:**
1. Verify the VPS is up by accessing it from a cellular network (e.g., mobile hotspot).
2. If the VPS is up, the issue is local hospital ISP.
3. Switch primary router to 5G backup dongle.
4. During the offline window, clinical staff must use paper fallback for critical care.

---

## 6. Printer Disconnected / Spooler Jam

**Symptoms:**
- Clicking "Print Bill" or "Print Prescription" does nothing.
- Browser print dialog hangs.

**Procedures:**
1. The software relies on the browser's native print dialog.
2. Check the physical USB/Network connection to the printer.
3. Clear the Windows Print Spooler: Run `net stop spooler` and `net start spooler` from the Reception PC.
4. Reprint from the "Recent Visits" table in the UI. No data is lost.
