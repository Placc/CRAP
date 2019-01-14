FROM node:8-alpine

WORKDIR /
RUN mkdir /app

WORKDIR /app

RUN yarn global add @tcurdt/package-utils
RUN yarn global add dotenv
RUN yarn global add nyc
RUN yarn global add mocha
RUN yarn global add nodemon

RUN apk update && \
    apk add mysql-client && \
    apk add bash

COPY common /app/common/
COPY ca /app/ca/
ADD ./common/wait-for-it.sh /app/ca/src/db

ENV PORT=3001 DEBUG_PORT=9229

WORKDIR /app/ca
RUN yarn

EXPOSE ${PORT}
EXPOSE ${DEBUG_PORT}

ADD ca/run.sh /app/ca/run.sh
RUN ["sed", "-i", "-e", "s/\r$//", "/app/ca/run.sh"]

RUN chmod +x /app/ca/run.sh

# DB
SHELL ["/bin/bash", "-c"]

ENV DB_USER=test \
    DB_PASSWORD=zaphod \
    DB_DATABASE=test

RUN ["sed", "-i", "-e", "s/\r$//", "/app/ca/src/db/reset_dbs.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/ca/src/db/resetdb_ca.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/ca/src/db/wait-for-it.sh"]

RUN chmod +x /app/ca/src/db/reset_dbs.sh
RUN chmod +x /app/ca/src/db/resetdb_ca.sh
RUN chmod +x /app/ca/src/db/wait-for-it.sh

CMD ["/bin/sh", "/app/ca/run.sh"]
