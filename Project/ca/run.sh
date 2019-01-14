#!/bin/sh

if ! $RESET_DB; then
    echo "Debugging: ${DEBUG}";
    if ! $DEBUG; then 
        node /app/ca/build/src/index.js;
    else
        nodemon -L --watch /app/ca/build --inspect-brk=0.0.0.0:${DEBUG_PORT} --nolazy /app/ca/build/src/index.js;
    fi
else
    echo "Disabled ca...";
    while :; do sleep 1000; done # Wait forever...
fi