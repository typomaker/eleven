FROM node:alpine
RUN apk --no-cache add --virtual build-deps build-base python bash git openssh
WORKDIR /server
ENTRYPOINT ["bash", "./docker-entrypoint.sh"]
ENV ENV=production
ENV NODE_ENV=${ENV}
COPY package* ./
COPY . .
