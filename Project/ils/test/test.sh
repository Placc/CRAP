
#!/bin/sh
docker-compose -f ./docker-compose.yml up --detach;

echo "[ILS] Running tests...";
docker-compose exec ils nyc mocha --exit --recursive build/test;
result=$?;

docker-compose stop;

exit $result;