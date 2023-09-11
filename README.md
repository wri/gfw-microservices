## GFW-PRO Microservices

This is a monorepo project that contains all `GFW-PRO` microservices.

### Install

First, we have to install and use node version `20.5.1`

Second you have to install the `nx` as global:

```sh
npm install -g nx
```

Install all dependencies needed for the project:

```sh
npm install --legacy-peer-deps
```

---

**NOTE**

we use Husky to automatically run format, lint and test , but to install it you must run `npm install --legacy-peer-deps` at least once. Thus, lint-staged will see what is being changed and run the steps on top of them.

---

#### Pre-requisites for webserver

##### Docker Command to Build/Run

Docker is used to run a redis container for development builds

```sh
docker-compose -f docker-compose.website.dev.yml build
docker-compose -f docker-compose.website.dev.yml up -d
```

You will need to set REDIS_HOST value in the .env file to point to the localhost or
another host if your redis confguration requires a different IP address.

```sh
REDIS_HOST=127.0.0.1
```

##### Stored procedures

This step was previously necessary because the webserver component didn't support typescript,
but webserver can use typescript now, so this could be removed soon with some changes on how
the queries are imported. In the meantime, the following command needs to be run to typescript
queries into regular javascript code and placed in a directory webserver knows to consume.

> run the following command for a one-time query conversion

```sh
npx tsc ./libs/sql/src/lib/queries/index.ts --outDir ./apps/webserver/src/queries
```

When actively modifying stored procedures, it will be useful to continuously convert the queries
with the following command

```sh
npx tsc ./libs/sql/src/lib/queries/index.ts --outDir ./apps/webserver/src/queries --watch
```

##### Tippecanoe

Tippecanoe is a software package that is used to generate mapbox vector tiles for lists.
To install on MacOS, use the brew.

```sh
brew install tippecanoe
```

To install on Ubuntu, use the following commands

```sh
sudo apt-get update
sudo apt-get install git build-essential libsqlite3-dev zlib1g-dev
mkdir -p /tmp/tippecanoe-src
git clone https://github.com/mapbox/tippecanoe.git /tmp/tippecanoe-src
cd /tmp/tippecanoe-src
make
sudo make install
rm -rf /tmp/tippecanoe-src
```

After installation tippecanoe must be in your path.
NOTE: You may need to start a new terminal window to see the affect of the installtion.
To check you can run the following command

```sh
which tippecanoe
```

That should print out the full path to the tippecanoe binary. If it prints nothing, or an
error message, the installtion didn't work right.

You can also run the tippecanoe command without any paramaters

```sh
tippecanoe
```

It should run the tippecanoe binary and print an error message like the following

```sh
tippecanoe: must specify -o out.mbtiles or -e directory
```

### Run

Before running the microservices, you have to create a `.env` file inside the root of the project.

Inside each microservice app there is an `example.env` file where you can find `ENVIRONMENT VARIABLE`s needed for that app.

If you consider having one .env is more convenient, here is a simple command to gather all the example.env files and create the .env file at the root of the repo:

```sh
cat apps/*/*/*.env | sort | uniq > .env
```

Here is the loading order of environment files: https://nx.dev/recipes/environment-variables/define-environment-variables

#### Webserver

Once everything is setup, run the webserver with the following command.
This will start the typescript compilation for the backend, run the backend, start webpack build
for the frontend, and serve it up on default 8443 port. This command also watches the filesystem
for changes to any code files and will automatically rebuild and re-serve the webserver.

```sh
nx serve webserver
```

#### List-Downloader

The following command runs the downloader microservice; this microservice has the logic to create CSVs or Shapefiles using the data stored inside the database.

```sh
nx serve microservices-list-downloader
```

> Check the environment variable `AWS_TMP_QUEUE=` inside pro-temp **.secret** and microservices **.env** are pointing to the same queue.

#### B2B

The following command runs the b2b microservice; it allows organizations to share lists between them.

```sh
nx serve microservices-b2b
```

#### List-Processing

The following command runs the list-processing microservice; it allows users to upload large lists and execute copy/move operations.

```sh
nx serve microservices-list-processing
```

> Check the environment variable `LISTS_MICROSERVICE_URL=` inside the **.secret** file in the `pro-temp` project. Make sure it is pointing to the right IP address.

```sh
LISTS_MICROSERVICE_URL=http://192.168.5.147:3333/api
```

or

```sh
LISTS_MICROSERVICE_URL=http://host.docker.internal:3333/api
```

> recommend that you connect to the special DNS name `host.docker.internal` which resolves to the internal IP address used by the host

### Webserver

> This project contains our front-end and back-end

### Test

To run tests for a microservice, just specify the name of the microservice:

```sh
nx test microservices-list-downloader
```

### Format

If you want to run `prettier` to format the code, you can use the following command to specify the name of the microservice.

```sh
nx format microservices-list-downloader
```

### Lint

If you want to run `lint`, you can use the following command;

```sh
nx lint microservices-list-downloader
```

### Project Structure

```sh
.
├── apps/              # contains the application projects.
│   ├── webserver/     # gfwpro project contains our front-end and back-end
│   └── microservices/
│       ├── b2b/       # store all b2b logic
│       ├── list-downloader/ # store all list downloader logic
│       └── list-processing/ # store all large list processing logic
├── libs/       #contains the library projects
│   ├── aws/    # shared library that know how to connect to AWS
│   ├── geo/    # shared library that store geo processing functions
│   ├── shared/ # shared library for code that don't have a logic group.
│   └── sql/    # shared library used to connect to the database and run the Stored Procedure.
├── test_files/
├── tools/         # contains scripts that act on your code base.
│   ├── mapLayersBackup/  # backup of all layer and dataset configs from the map layer API
├── .editorconfig  # file to standardize our IDE
├── .eslintrc.json # lint configuration file
├── jest.config.ts # jest configuration file
├── jest.preset.js # used to set stuff before running tests
├── nx.json   # configures the Nx CLI itself
├── package.json # store the libraries needed for the project
├── README.md
├── tsconfig.base.json # sets up the global TypeScript settings and creates aliases for each library to aid
└── workspace.json # has the path of all shared libraries and project
```

### Map Layers Backup

Currently the datasets and layers used by GFW Pro are updated via Postman calling APIs on GFW (that may be proxying to resourcewatch APIs). Any mistake in this process has the potential to delete or hurt user experience on production immediately, and there is no good way to recover old settings. As a starting point, we decided to store all the settings in this git repository for backup. See https://gfw.atlassian.net/wiki/spaces/GPS/pages/edit-v2/449708059

### Commit Lint

Our project forces you to use the following pattern to commit on our project:

> type(scope): subject

- **type** according to build commitlint conventions, we have the following types:
  - `chore`
  - `ci`
  - `docs`
  - `feat`
  - `fix`
  - `perf`
  - `refactor`
  - `revert`
  - `style`
  - `test`
- **scope** is our nx modules like: `
  - `geo`
  - `microservices-list-downloader`
  - `microservices-list-processing`
  - `shared`
  - `sql`
- **subject** the message that you want to pass with your commit.

### NX Basic Commands

#### Generate an application

Run nx g @nrwl/nest:app my-app to generate an application.

> When using Nx, you can create multiple applications and libraries in the same workspace.

#### Generate a library

Run nx g @nrwl/nest:lib my-lib to generate a library.

> Libraries are shareable across libraries and applications. They can be imported from @wri-monorepos/mylib.

#### Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:3333/. The app will automatically reload if you change any of the source files.
