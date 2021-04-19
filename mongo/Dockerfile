FROM mongo:4.0-xenial
RUN set -eux; \
  apt-get update; \
  apt-get install -y --no-install-recommends \
  curl \
  ; \
  rm -rf /var/lib/apt/lists/*

RUN curl  -L https://github.com/herloct/url-parser/releases/download/1.0.0-beta4/url-parser-`uname -s`-x86_64 > /usr/local/bin/url-parser; chmod +x /usr/local/bin/url-parser
