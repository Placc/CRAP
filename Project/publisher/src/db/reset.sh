#!/bin/sh

echo "Resetting databases...";
db_services="publisherdb publisher";

docker-compose -f ./docker-compose.yml up --detach ${db_services};

docker-compose exec publisher ./src/db/wait-for-it.sh -t 0 publisherdb:3306 -- ./src/db/reset_dbs.sh;

docker-compose stop;