FROM node:8-alpine

ENV PORT=3005 DEBUG=9232

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
COPY auditor /app/auditor/
ADD ./common/wait-for-it.sh /app/auditor/src/db

WORKDIR /app/auditor
RUN yarn

EXPOSE ${PORT}
EXPOSE ${DEBUG}

ADD auditor/run.sh /app/auditor/run.sh
RUN ["sed", "-i", "-e", "s/\r$//", "/app/auditor/run.sh"]

RUN chmod +x /app/auditor/run.sh

# DB
SHELL ["/bin/bash", "-c"]

ENV DB_USER=test \
    DB_PASSWORD=zaphod \
    DB_DATABASE=test

RUN ["sed", "-i", "-e", "s/\r$//", "/app/auditor/src/db/reset_dbs.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/auditor/src/db/resetdb_auditor.sh"]
RUN ["sed", "-i", "-e", "s/\r$//", "/app/auditor/src/db/wait-for-it.sh"]

RUN chmod +x /app/auditor/src/db/reset_dbs.sh
RUN chmod +x /app/auditor/src/db/resetdb_auditor.sh
RUN chmod +x /app/auditor/src/db/wait-for-it.sh

CMD ["/bin/sh", "/app/auditor/run.sh"]
