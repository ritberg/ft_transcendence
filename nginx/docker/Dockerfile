FROM alpine:3.19

RUN apk update

RUN apk add nginx
RUN mkdir -p /etc/nginx/ssl
RUN apk add openssl
RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out /etc/nginx/ssl/ping.crt -keyout /etc/nginx/ssl/ping.key -subj "/C=CH/ST=Vaud/L=Renens/O=42/OU=42/CN=ft_transcendance"
RUN mkdir -p /var/run/nginx
COPY ./conf/default /etc/nginx/conf.d/default.conf
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY ./static /etc/nginx/static

CMD [ "nginx", "-g", "daemon off;" ]