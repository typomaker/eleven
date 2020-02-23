#!/usr/bin/env bash
set -eo pipefail

echo "DOMAIN=${DOMAIN}";

if [[ "$ENV" == "development" ]]; then
    if [[ ! -d /ssl/certs ]]; then
      echo "Creating /ssl/certs"
      mkdir -p /ssl/certs
    fi
    if [[ -f /ssl/certs/server.key ]]; then
      KEY_OPT="-key"
    else
      KEY_OPT="-keyout"
    fi
    openssl req \
        -x509 \
        -newkey rsa:4096 \
        -sha256 \
        -days 3650 \
        -nodes \
        ${KEY_OPT} /ssl/certs/server.key \
        -out /ssl/certs/server.crt \
        -extensions san \
        -config <(echo '[req]'; \
        echo 'distinguished_name=req'; \
        echo '[san]'; \
        echo "subjectAltName=DNS:${DOMAIN},DNS:gateway.${DOMAIN}" \
        ) \
        -subj "/CN=${DOMAIN}"
fi

for f in $(find /conf.d/ -regex '.*\.conf'); do
    envsubst '${DOMAIN}' < ${f} > "/etc/nginx/conf.d/$(basename $f)";
    cat /etc/nginx/conf.d/$(basename $f);
    echo
    done

exec "$@"