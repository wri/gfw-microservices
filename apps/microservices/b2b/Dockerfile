FROM amd64/node:20.5.1 as builder
WORKDIR /build
COPY package.json .
COPY yarn.lock .

RUN yarn install

FROM amd64/node:20.5.1 as appbuilder
WORKDIR /appbuilder
COPY --from=builder /build/ /appbuilder/
COPY ./ .
RUN /appbuilder/node_modules/.bin/nx build microservices-b2b --configuration=production


FROM amd64/node:20.5.1
WORKDIR /app
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384

# Pass latest commit hash to the container
ARG LATEST_COMMIT
ENV LATEST_COMMIT ${LATEST_COMMIT}

COPY --from=appbuilder /appbuilder/dist/apps/microservices/b2b/ /app/
COPY package.json .
COPY yarn.lock .
COPY ./apps/microservices/b2b/.env .
RUN yarn install
# RUN export NODE_OPTIONS="--max-old-space-size=8192"

CMD [ "node", "main.js" ]
