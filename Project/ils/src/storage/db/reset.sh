#!/bin/sh

echo "Resetting databases...";
db_services="mysql ilsdb db-seed";

docker-compose -f ./docker-compose.yml up --detach ${db_services};

docker-compose exec db-seed ./wait-for-it.sh -t 0 mysql:3306 -- ./wait-for-it.sh -t 0 ilsdb:3306 -- ./reset_dbs.sh;

docker-compose stop;