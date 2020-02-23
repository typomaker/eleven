FROM nats:alpine
COPY nats-server.conf /etc/nats/nats-server.conf
ENTRYPOINT [ "nats-server" ]
CMD ["--config", "/etc/nats/nats-server.conf"]