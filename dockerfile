FROM node:10.0.0-alpine AS build

ADD ./client /client
ADD ./package.json /package.json
ADD ./tsconfig.json /tsconfig.json
ADD ./src /src
RUN npm install
RUN npm install -g typescript
RUN npm run heroku-postbuild
RUN tsc

FROM node:10.0.0-alpine

RUN mkdir /server
RUN mkdir /server/client
ADD ./package.json /server/package.json
ADD ./swagger.yaml /server/swagger.yaml
COPY --from=build /client /server/client
COPY --from=build /dist /server/src
WORKDIR /server
RUN npm install --only=prod

EXPOSE 80
CMD ["node", "./src/index.js"]
