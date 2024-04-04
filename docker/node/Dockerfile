FROM node:alpine

RUN apk update
#RUN apk upgrade

WORKDIR /usr/src/app

COPY server/package.json ./
RUN npm i ws
COPY /server/index.js ./server.js
RUN chmod +x ./server.js

CMD ["node","/usr/src/app/server.js"]