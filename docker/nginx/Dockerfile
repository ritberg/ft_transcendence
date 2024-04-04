FROM nginx:alpine

RUN apk update
#RUN apk upgrade

RUN rm -rf /usr/share/nginx/html

COPY pong_files /usr/share/nginx/html

CMD [ "nginx", "-g", "daemon off;" ]