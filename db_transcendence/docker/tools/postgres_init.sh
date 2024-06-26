#!/bin/bash

# Start the PostgreSQL service
until psql -U "$POSTGRES_USER" -c '\l'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Switch to the postgres user to execute PostgreSQL commands
psql <<EOF
-- Create the database
CREATE DATABASE ${DB_TRANSCENDENCE_NAME};

-- Create the user with password
CREATE USER ${DB_TRANSCENDENCE_USER} WITH PASSWORD '${DB_TRANSCENDENCE_PASSWORD}';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE ${DB_TRANSCENDENCE_NAME} TO ${DB_TRANSCENDENCE_USER};
EOF

service postgresql stop

postgres -c config_file=/etc/postgresql/pg_hba.conf