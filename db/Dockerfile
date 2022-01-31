FROM postgres:14-alpine

ARG password
ENV POSTGRES_DB=palitronica

EXPOSE 5432

COPY init.sql /docker-entrypoint-initdb.d/
