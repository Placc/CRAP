
#!/bin/sh
docker-compose -f ./docker-compose.yml up --detach;

echo "[Monitor] Running tests...";
docker-compose exec monitor nyc mocha --exit --recursive build/test;
result=$?;

docker-compose stop;

exit $result;