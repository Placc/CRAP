
#!/bin/sh
docker-compose -f ./docker-compose.yml up --detach;

echo "[CA] Running tests...";
docker-compose exec ca nyc mocha --exit --recursive build/test;
result=$?;

docker-compose stop;

exit $result;