# Use the official PostgreSQL image from the Docker Hub
FROM postgres:16.2

# RUN apt-get update
# RUN apt-get install vim -y

# Add your initialization script to the container
COPY ./tools/postgres_init.sh /docker-entrypoint-initdb.d/postgres_init.sh

# COPY ./conf/pg_hba.conf /etc/postgresql/pg_hba.conf

# Ensure the script is executable
RUN chmod +x /docker-entrypoint-initdb.d/postgres_init.sh