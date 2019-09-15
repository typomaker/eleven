FROM node:alpine
RUN apk update && apk upgrade \
    && apk add --no-cache bash git openssh
WORKDIR /client
CMD ["npm", "run", "start"]
ENV NODE_ENV=development
COPY . .