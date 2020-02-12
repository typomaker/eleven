FROM node:alpine
RUN apk --no-cache add --virtual build-deps build-base python bash git openssh
WORKDIR /app
ENTRYPOINT ["bash", "./entrypoint.sh"]
ENV ENV=production
COPY package* ./
COPY . .
