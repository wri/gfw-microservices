# Install the main node OS from an official image.
FROM amd64/node:20.11.1
FROM amd64/node:20.11.1

#Description of the Image.
LABEL Description="This is the Global Forest Watch Pro web application container."

# Arguments that need to be passed into the docker file build command
# if they have not been specified in your docker-compose or ECS
# environment variables.
ARG NODE_ENV
ARG LATEST_COMMIT

# Main Environment Variables.
# NOTE: NODE_ENV and PM2_CONFIG both need to defined in
#       the docker-compose file or passed in via arguments (ECS).
#       Otherwise the defaults below will be utilized.
ENV NODE_ENV ${NODE_ENV}
ENV LATEST_COMMIT ${LATEST_COMMIT}

# Update everything that needs to be updated and do a clean.
RUN apt-get -y update \
  && apt-get -y install git build-essential libsqlite3-dev zlib1g-dev
RUN apt-get clean

# Create a directory and copy in all files
RUN mkdir -p /tmp/tippecanoe-src
RUN git clone https://github.com/mapbox/tippecanoe.git /tmp/tippecanoe-src
WORKDIR /tmp/tippecanoe-src

# Build tippecanoe
RUN make \
  && make install

# Remove the temp directory and unneeded packages
WORKDIR /
RUN rm -rf /tmp/tippecanoe-src \
  && apt-get -y remove --purge build-essential && apt-get -y autoremove

# Set the working directory
WORKDIR /srv

COPY dist/apps/webserver .
RUN rm -rf ./libs/sql
COPY dist/libs/sql ./libs/sql

# Copy package*.json (required for npm install below)
COPY package.json .
COPY package-lock.json .

# Install all dependencies. Expects lockfile version to match.
# RUN npm --production=false ci
RUN npm --legacy-peer-deps --include=dev ci

# Run script to build webpack client bundles
WORKDIR /srv/apps/webserver/src
COPY apps/webserver/src/run-app.sh .
RUN chmod -R 774 run-app.sh
RUN bash ./run-app.sh

# Ensure correct permissions for Vector tiles directory
RUN chmod -R 775 ./vectorTiles

EXPOSE 80

# Start application command.
WORKDIR /srv
CMD ["node", "server.js"]
