# Run GitHub Actions locally

This is a foldet that contain Action configuration that allows you to run GitHub Actions locally. It's powered by [act](https://github.com/nektos/act).

Check the installation guide in the act repository, and then run the any of the following command to run the action locally:

```bash
act -W .github/workflows/release.yml -e act/WEB-event.json
act -W .github/workflows/release.yml -e act/LD-event.json
act -W .github/workflows/release.yml -e act/LP-event.json
```

## Dependencies

In order to run act you need to have Docker installed and running on your machine.

# Event file

The event file is a JSON file that contains the event data that will be passed to the action. You can find the event files in the `act` folder.

For the moment we have 3 event files:

- `WEB-event.json`: This event file is used to simulate the creation of a new release for Web server.
- `LD-event.json`: This evemt file is used to simulate the creation of a new release for List Downloader Microservice.
- `LP-event.json`: This evemt file is used to simulate the creation of a new release for List Process Microservice.

# Workflow file

The workflow file is the file that contains the GitHub Actions configuration. You can find the workflow file in the `.github/workflows` folder.

For the moment we are only using one workflow file(`release.yml`) with act, but we can have multiple workflow files if we need to.

# Dockerfile

The docker containers are created automatically when we run the act command.
