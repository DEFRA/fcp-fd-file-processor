# fcp-fd-file-processor
Microservice to process file uploads into the Single Front Door (SFD).

This service is part of the [Single Front Door (SFD) service](https://github.com/DEFRA/fcp-fd-core).

## Prerequisites
- Docker
- Docker Compose

Optional:
- Kubernetes
- Helm

## Setup

### Configuration

These configuration values should be set in the docker-compose.yaml file or Helm values.yaml file if deploying to Kubernetes.

| Name                      | Default Value                                          | Required                  | Description                                                                 |
|---------------------------|--------------------------------------------------------|---------------------------|-----------------------------------------------------------------------------|
| USE_AZURITE               | false                                                  | No                        | Flag to use Azurite for local development                                   |
| AZURITE_HOST              | http://fcp-fd-file-processor-azurite-development       | No                        | Azurite host name                                                          |
| AZURITE_BLOB_PORT         | 10000                                                  | No                        | Azurite blob port                                                          |
| AZURITE_ACCESS_KEY        | test                                                   | No                        | Access key for Azurite                                                     |
| DMZ_STORAGE_ACCOUNT_NAME  | dmz                                                    | Yes                       | The name of the DMZ storage account                                        |
| DMZ_STORAGE_ACCESS_KEY    | (no default value)                                     | No                        | Access key to DMZ storage account (should only be used for local development)|
| MANAGED_IDENTITY_CLIENT_ID| (no default value)                                     | Yes - If production build | Managed identity client ID                                                 |
| OBJECTS_CONTAINER_NAME    | objects                                                | No                        | Optional container name override. Intended to be overridden with dev suffix if using a shared storage account. |
| ALLOW_TEXT_FILES          | false                                                  | No                        | Flag to allow text files to be uploaded. Intended to allow testing of malware scanning. |

## Running the application

The application is designed to run in containerised environments, using Docker Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to run the service with either Docker Compose or Kubernetes.

When using the Docker Compose files in development the local `app` folder will
be mounted on top of the `app` folder within the Docker container, hiding the CSS files that were generated during the Docker build.  For the site to render correctly locally `npm run build` must be run on the host system.


By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start

Use Docker Compose to run service locally.

```
docker-compose up
```

## Test structure

The tests have been structured into subfolders of `./test` as per the
[Microservice test approach and repository structure](https://eaflood.atlassian.net/wiki/spaces/FPS/pages/1845396477/Microservice+test+approach+and+repository+structure)

### Running tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```
# Run all tests
scripts/test

# Run tests with file watch
scripts/test -w
```

## CI pipeline

This service uses the [FFC CI pipeline](https://github.com/DEFRA/ffc-jenkins-pipeline-library)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
