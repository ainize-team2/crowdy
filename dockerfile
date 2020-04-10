FROM node:10.0.0-alpine AS build

ADD ./client /client
WORKDIR /client
RUN npm install
RUN npm run build

FROM node:10.0.0-alpine

RUN mkdir /server
RUN mkdir /client
ADD ./src /server/src
ADD ./package.json /server/package.json
COPY --from=build /client/build /client/build
WORKDIR /server
RUN npm install --only=prod

CMD ["npm", "start"]
