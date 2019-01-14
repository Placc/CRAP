#!/bin/sh

echo "Resetting databases...";
db_services="cadb ca";

docker-compose -p $1 -f ./docker-compose.yml up --detach ${db_services};

docker-compose -p $1 exec ca ./src/db/wait-for-it.sh -t 0 cadb:3306 -- ./src/db/reset_dbs.sh;

docker-compose -p $1 stop;