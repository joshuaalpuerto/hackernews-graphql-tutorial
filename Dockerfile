FROM node:8.9.3-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app

# RUN npm install

EXPOSE 3000

CMD [ “npm”, “start” ]