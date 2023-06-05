# Install the main node OS from an official image.
FROM node:16.15.1

#Description of the Image.
LABEL Description="This is the Global Forest Watch Pro web application container."

# Arguments that need to be passed into the docker file build command
# if they have not been specified in your docker-compose or ECS
# environment variables.
ARG NODE_ENV

# Main Environment Variables.
# NOTE: NODE_ENV and PM2_CONFIG both need to defined in
#       the docker-compose file or passed in via arguments (ECS).
#       Otherwise the defaults below will be utilized.
ENV NODE_ENV ${NODE_ENV}

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
WORKDIR /srv/src

# Copy all required files into the working directory.
COPY src/package.json .
COPY src/package-lock.json .
COPY src/postcss.config.js .
COPY src/.babelrc .
COPY src/server.js .
COPY src/load-env.js .
COPY src/run-app.sh .
COPY src/client client
COPY src/config config
COPY src/server server
COPY tsconfig.json .

# Create Vector tiles directory
RUN mkdir vectorTiles
RUN chmod -R 775 vectorTiles

# Install all dependencies. Expects lockfile version to match.
RUN npm --legacy-peer-deps ci

# Change file permissions for run script.
RUN chmod -R 774 run-app.sh
RUN bash ./run-app.sh

# Start application command.
CMD ["node", "config/scripts/start.js"]
