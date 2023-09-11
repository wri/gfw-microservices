FROM amd64/node:20.5.1 as builder
WORKDIR /build
COPY package.json .
COPY yarn.lock .

RUN yarn install

FROM amd64/node:20.5.1 as appbuilder
WORKDIR /appbuilder
COPY --from=builder /build/ /appbuilder/
COPY ./ .

RUN /appbuilder/node_modules/.bin/nx build microservices-externalapi --configuration=production


FROM amd64/node:20.5.1
WORKDIR /app
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384
COPY --from=appbuilder /appbuilder/dist/apps/microservices/externalapi/ /app/
COPY package.json .
COPY yarn.lock .
COPY ./apps/microservices/externalapi/.env .
RUN yarn install

CMD [ "node", "main.js" ]
