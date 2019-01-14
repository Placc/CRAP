
#!/bin/sh
docker-compose -f ./docker-compose.yml up --detach;

echo "[Auditor] Running tests...";
docker-compose exec auditor nyc mocha --exit --recursive build/test;
result=$?;

docker-compose stop;

exit $result;