#!/bin/sh

if ! $RESET_DB; then
    echo "Debugging: ${DEBUG}";
    if [[ -z "${DEBUG}" ]]; then 
        node /app/monitor/build/src/index.js;
    else
        nodemon -L --watch /app/monitor/build --inspect-brk=0.0.0.0:${DEBUG} --nolazy /app/monitor/build/src/index.js;
    fi
else
    echo "Disabled monitor...";
    while :; do sleep 1000; done # Wait forever...
fi