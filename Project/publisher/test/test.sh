
#!/bin/sh
docker-compose -f ./docker-compose.yml up --detach;

echo "[Publisher] Running tests...";
docker-compose exec publisher nyc mocha --exit --recursive build/test;
result=$?;

docker-compose stop;

exit $result;