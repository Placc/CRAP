#!/bin/sh

echo "Resetting databases...";
db_services="monitordb monitor";

docker-compose -f ./docker-compose.yml up --detach ${db_services};

docker-compose exec monitor ./src/db/wait-for-it.sh -t 0 monitordb:3306 -- ./src/db/reset_dbs.sh;

docker-compose stop;