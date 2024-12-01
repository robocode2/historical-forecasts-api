# db/Dockerfile
FROM postgres:latest

# Copy the seed SQL file to the initialization directory
COPY testforecastsdb.sql /docker-entrypoint-initdb.d/
