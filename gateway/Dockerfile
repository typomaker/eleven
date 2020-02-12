FROM golang as development
STOPSIGNAL 2
WORKDIR /app
EXPOSE 80
COPY . .
RUN go get github.com/pilu/fresh \
  && go get github.com/go-delve/delve/cmd/dlv

ENV CGO_ENABLED 0
ENV GOOS linux

RUN go build -a -installsuffix=cgo -o /go/bin/wss
CMD ["wss"]

FROM scratch as production
EXPOSE 80
COPY --from=development /go/bin/wss /wss
COPY --from=development /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
CMD ["/wss"]