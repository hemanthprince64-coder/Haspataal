#!/bin/bash
set -e

# Configuration
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

DB_USER=${POSTGRES_USER:-haspataal}
DB_NAME=${POSTGRES_DB:-haspataal}
DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <path_to_backup_file.sql.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: File $BACKUP_FILE not found!"
    exit 1
fi

echo "[WARNING] This will overwrite the current database '${DB_NAME}'."
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation aborted."
    exit 1
fi

echo "[INFO] Terminating active connections..."
# Terminate connections before dropping the DB
if docker ps | grep -q haspataal-db; then
    docker exec -t haspataal-db psql -U ${DB_USER} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';"
else
    PGPASSWORD="${POSTGRES_PASSWORD}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';"
fi

echo "[INFO] Dropping and recreating database '${DB_NAME}'..."
if docker ps | grep -q haspataal-db; then
    docker exec -t haspataal-db dropdb -U ${DB_USER} ${DB_NAME} --if-exists
    docker exec -t haspataal-db createdb -U ${DB_USER} ${DB_NAME}
else
    PGPASSWORD="${POSTGRES_PASSWORD}" dropdb -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME} --if-exists
    PGPASSWORD="${POSTGRES_PASSWORD}" createdb -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME}
fi

echo "[INFO] Restoring data from ${BACKUP_FILE}..."
if docker ps | grep -q haspataal-db; then
    # Copy file into container then restore
    docker cp ${BACKUP_FILE} haspataal-db:/tmp/backup.sql.gz
    docker exec -t haspataal-db bash -c "gunzip -c /tmp/backup.sql.gz | psql -U ${DB_USER} -d ${DB_NAME}"
    docker exec -t haspataal-db rm /tmp/backup.sql.gz
else
    gunzip -c ${BACKUP_FILE} | PGPASSWORD="${POSTGRES_PASSWORD}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}
fi

echo "[SUCCESS] Database restore completed successfully."
