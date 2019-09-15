FROM nginx:alpine
RUN apk add --no-cache openssl bash
ENTRYPOINT ["bash", "./entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
COPY entrypoint.sh .
COPY conf.d/ /conf.d/
ENV ENV=production
