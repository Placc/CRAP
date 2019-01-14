FROM node:8-alpine

ENV PORT=3006 DEBUG=9233

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
COPY monitor /app/monitor/
ADD ./common/wait-for-it.sh /app/monitor/src/db

WORKDIR /app/monitor
RUN yarn

EXPOSE ${PORT}
EXPOSE ${DEBUG}

ADD monitor/run.sh /app/monitor/run.sh
RUN ["sed", "-i", "-e", "s/\r$//", "/app/monitor/run.sh"]

RUN chmod +x /app/monitor/run.sh

# DB
SHELL ["/bin/bash", "-c"]

ENV DB_USER=test \
    DB_PASSWORD=zaphod \
    DB_DATABASE=test

RUN ["sed", "-i", "-e", "s/\r$//", "/app/monitor/src/db/reset_dbs.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/monitor/src/db/resetdb_monitor.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/monitor/src/db/wait-for-it.sh"]

RUN chmod +x /app/monitor/src/db/reset_dbs.sh
RUN chmod +x /app/monitor/src/db/resetdb_monitor.sh
RUN chmod +x /app/monitor/src/db/wait-for-it.sh

CMD ["/bin/sh", "/app/monitor/run.sh"]
