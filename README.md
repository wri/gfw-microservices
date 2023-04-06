## GFW-PRO Microservices

This is a monorepo project that store all `GFW-PRO` microservices.

### Install 

First we have to install and use node with the version `16.15.1`

Second you have to install the `nx` as global:

```sh
npm install -g nx
```

Install all dependencies needed for the project.

```sh
npm install
``` 

### Run

Before running the microservices you have to create `.env` file inside the root of project, inside each project has an `example.env` file, where you can find ENVIRONMENT VARIABLE need for the project.

#### List-Downloader

The following command run the downloader microservices, this microservices has the logic to create CSV or Shapefile using the data stored inside the database. 

```sh
nx serve microservices-list-downloader
``` 

> Check the environment variable `AWS_TMP_QUEUE=` inside pro-temp **.secret** and microservices **.env** are pointing to the same queue.

#### B2B

The following command run the b2b, allow organizations share list between then. 

```sh
nx serve microservices-b2b
``` 

#### List-Processing

The following command run the command to list-processing, grant the system to upload large list and realize copy or move of locations.

```sh
nx serve microservices-list-processing
```

> Check the environment variable `LISTS_MICROSERVICE_URL=` , inside **.secret** file in pro-temp project, is point to the right ip address

```sh
LISTS_MICROSERVICE_URL=http://192.168.5.147:3333/api
```

### Test

If you want to run `test` can use the following command, just have to specify the name of the microservice.

```sh
nx test microservices-list-downloader
```

### Format 

If you want to run `prettier` to format the code, can use the following command, just have to specify the name of the microservice.

```sh
nx format microservices-list-downloader
```


### Lint

If you want to run `lint` can use the following command, just have to specify the name of the microservice.

```sh
nx lint microservices-list-downloader
```


### Project Structure

```sh
.
├── apps/              # contains the application projects.    
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
