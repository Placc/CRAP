#!/bin/sh

if ! $RESET_DB; then
    echo "Debugging: ${DEBUG}";
    if [[ -z "${DEBUG}" ]]; then 
        node /app/publisher/build/src/index.js;
    else
        nodemon -L --watch /app/publisher/build --inspect-brk=0.0.0.0:${DEBUG} --nolazy /app/publisher/build/src/index.js;
    fi
else
    echo "Disabled publisher...";
    while :; do sleep 1000; done # Wait forever...
fi