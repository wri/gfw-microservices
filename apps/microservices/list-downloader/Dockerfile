FROM amd64/node:20.11.1 as builder
WORKDIR /build
COPY package.json .
COPY package-lock.json .

RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && for i in 1 2 3; do npm ci --legacy-peer-deps && break || { echo "npm ci failed (attempt $i), retrying..."; [ "$i" -lt 3 ] && sleep 15 || exit 1; }; done

FROM amd64/node:20.11.1 as appbuilder
WORKDIR /appbuilder
COPY --from=builder /build/ /appbuilder/
COPY ./ .
RUN /appbuilder/node_modules/.bin/nx build microservices-list-downloader --configuration=production


FROM amd64/node:20.11.1
WORKDIR /app
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384

# Arguments that need to be passed into the docker file build command
# Needed to store the generated downloable files in the correct S3 bucket directory
ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}

# Pass latest commit hash to the container
ARG LATEST_COMMIT
ENV LATEST_COMMIT ${LATEST_COMMIT}

COPY --from=appbuilder /appbuilder/dist/apps/microservices/list-downloader/ /app/
COPY package.json .
COPY package-lock.json .
COPY ./apps/microservices/list-downloader/.env .
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && for i in 1 2 3; do npm ci --legacy-peer-deps && break || { echo "npm ci failed (attempt $i), retrying..."; [ "$i" -lt 3 ] && sleep 15 || exit 1; }; done
# RUN export NODE_OPTIONS="--max-old-space-size=8192"

CMD [ "node", "main.js" ]
