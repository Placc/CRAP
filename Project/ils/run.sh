#!/bin/sh

if ! $RESET_DB; then
    echo "Debugging: ${DEBUG}";
    if [[ -z "${DEBUG}" ]]; then 
        node /app/ils/build/src/index.js;
    else
        node /app/ils/build/src/fix-bytebuffer.js;
        nodemon -L --watch /app/ils/build --inspect-brk=0.0.0.0:${DEBUG} --nolazy /app/ils/build/src/index.js;
    fi
else
    echo "Disabled ils...";
    while :; do sleep 1000; done # Wait forever...
fi