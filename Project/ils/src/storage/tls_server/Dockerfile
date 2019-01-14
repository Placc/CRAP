FROM golang:1.9


COPY ils/src/storage/tls_server /go/src/storage/tls_server

WORKDIR /go/src/storage
RUN go get ./tls_server

EXPOSE 8082

ENTRYPOINT /go/bin/tls_server

