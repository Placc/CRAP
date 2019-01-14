#!/bin/sh

if ! $RESET_DB; then
    echo "Debugging: ${DEBUG}";
    if [[ -z "${DEBUG}" ]]; then 
        node /app/auditor/build/src/index.js;
    else
        nodemon -L --watch /app/auditor/build --inspect-brk=0.0.0.0:${DEBUG} --nolazy /app/auditor/build/src/index.js;
    fi
else
    echo "Disabled auditor...";
    while :; do sleep 1000; done # Wait forever...
fi