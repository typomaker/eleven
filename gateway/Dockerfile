FROM golang:alpine as development
STOPSIGNAL 2
WORKDIR /gateway
EXPOSE 80
RUN apk add --no-cache bash git && \
  go get github.com/pilu/fresh && \
  go get github.com/go-delve/delve/cmd/dlv

ENV ENV=development CGO_ENABLED=0 GOOS=linux
COPY . .
CMD ["./docker-entrypoint.sh"]
FROM development as stage
RUN go build -a -installsuffix=cgo -o /go/bin/app
FROM scratch as production
EXPOSE 80
COPY --from=stage /go/bin/app /app
COPY --from=stage /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
CMD ["/app"]