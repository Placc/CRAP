FROM node:8-alpine

ENV PORT=3004 DEBUG=9231

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
COPY publisher /app/publisher/
ADD ./common/wait-for-it.sh /app/publisher/src/db

WORKDIR /app/publisher
RUN yarn

EXPOSE ${PORT}
EXPOSE ${DEBUG}

ADD publisher/run.sh /app/publisher/run.sh
RUN ["sed", "-i", "-e", "s/\r$//", "/app/publisher/run.sh"]

RUN chmod +x /app/publisher/run.sh

# DB
SHELL ["/bin/bash", "-c"]

ENV DB_USER=test \
    DB_PASSWORD=zaphod \
    DB_DATABASE=test

RUN ["sed", "-i", "-e", "s/\r$//", "/app/publisher/src/db/reset_dbs.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/publisher/src/db/resetdb_publisher.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/publisher/src/db/wait-for-it.sh"]

RUN chmod +x /app/publisher/src/db/reset_dbs.sh
RUN chmod +x /app/publisher/src/db/resetdb_publisher.sh
RUN chmod +x /app/publisher/src/db/wait-for-it.sh

CMD ["/bin/sh", "/app/publisher/run.sh"]
