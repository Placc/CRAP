FROM node:8-alpine

WORKDIR /
RUN mkdir /app

ENV PORT=3003 DEBUG=9230

WORKDIR /app

RUN yarn global add @tcurdt/package-utils
RUN yarn global add dotenv
RUN yarn global add nyc
RUN yarn global add mocha
RUN yarn global add nodemon

COPY common /app/common/
COPY ils /app/ils/

WORKDIR /app/ils
RUN yarn

EXPOSE ${PORT}
EXPOSE 8095
EXPOSE ${DEBUG}

ADD ils/run.sh /app/ils/run.sh
RUN ["sed", "-i", "-e", "s/\r$//", "/app/ils/run.sh"]

RUN chmod +x /app/ils/run.sh

CMD ["/bin/sh", "/app/ils/run.sh"]
