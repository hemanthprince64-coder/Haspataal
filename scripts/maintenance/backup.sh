#!/bin/bash
set -e

# Configuration
# Read from .env.production if it exists
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

DB_USER=${POSTGRES_USER:-haspataal}
DB_NAME=${POSTGRES_DB:-haspataal}
DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
S3_BUCKET=${BACKUP_S3_BUCKET:-haspataal-backups}
LOCAL_BACKUP_DIR="./backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="haspataal_db_${DATE}.sql.gz"
LOCAL_PATH="${LOCAL_BACKUP_DIR}/${FILENAME}"

# 1. Ensure local backup directory exists
mkdir -p ${LOCAL_BACKUP_DIR}

echo "[INFO] Starting database backup for $DB_NAME..."

# 2. Dump the database and compress
# We run this inside the docker container if running in docker-compose
if docker ps | grep -q haspataal-db; then
    docker exec -t haspataal-db pg_dump -U ${DB_USER} ${DB_NAME} | gzip > ${LOCAL_PATH}
else
    PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME} | gzip > ${LOCAL_PATH}
fi

echo "[SUCCESS] Database dumped to ${LOCAL_PATH}"

# 3. Upload to S3 (if aws-cli is installed and configured)
if command -v aws &> /dev/null; then
    echo "[INFO] Uploading to S3 bucket s3://${S3_BUCKET}/db-backups/..."
    aws s3 cp ${LOCAL_PATH} s3://${S3_BUCKET}/db-backups/${FILENAME}
    echo "[SUCCESS] Upload complete."
else
    echo "[WARN] aws-cli not found. Skipping S3 upload."
fi

# 4. Cleanup local backups older than 30 days
echo "[INFO] Cleaning up backups older than 30 days..."
find ${LOCAL_BACKUP_DIR} -name "haspataal_db_*.sql.gz" -type f -mtime +30 -delete

echo "[SUCCESS] Backup process completed successfully."
