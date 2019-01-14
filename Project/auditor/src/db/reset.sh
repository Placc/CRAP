#!/bin/sh

echo "Resetting databases...";
db_services="auditordb auditor";

docker-compose -f ./docker-compose.yml up --detach ${db_services};

docker-compose exec auditor ./src/db/wait-for-it.sh -t 0 auditordb:3306 -- ./src/db/reset_dbs.sh;

docker-compose stop;