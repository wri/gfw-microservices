## Automated Acceptance Testing

Run once. Installs the Cucumber Cypress Pre-Processes/

```
npm i --legacy-peer-deps
```

There are two ways to run the tests:

In the console, headless, from the root folder _/gfw-microservices_

```
nx e2e gfwpro-e2e
```

or using the Cypress UI from _/apps/gfwpro-e2e_

```
npx cypress open
```

Then select the _E2E Testing_ option

## Specification By Example

...our goals for these types of tests...

## Process for Adding New Examples/Abilities

...steps to make this happen: feedback from the product team, iteration in confluence, scoped in JIRA, etc...

## Process for Adding new Lists and Naming Conventions (managing data)

...work with Isa on this...

## Process for when tests fail

...strategy for evolving either the existing specifications or prompting discussion around the new feature being added...

## Our Approach (Sofware Testing Patterns)

mermaid diagrams of how our test code is structured (very similar to the Continous Delivery chapter on testing)

## The Directory Structure Explained

...especially the difference between the `abilities` folder and the `features` folder

## Third-Party Request Filtering

To improve readability of Cypress logs, this project includes automatic filtering of third-party network requests (Google Analytics, Hotjar, Zendesk, Plausible, LinkedIn, etc.) from the command log.

### Configuration

The filtering is controlled by the `hideThirdPartyRequests` environment variable in `cypress.config.ts`:

```typescript
env: {
  hideThirdPartyRequests: true, // Set to false to disable filtering
}
```

### How It Works

- Uses a MutationObserver to monitor the Cypress command log
- Detects XHR/Fetch requests to external domains (URLs containing `://` or starting with `www.`)
- Hides these requests from the visual log while preserving your application's API calls
- Only affects the visual display - doesn't interfere with test functionality

### Debugging

If you need to see all network requests temporarily:

1. Set `hideThirdPartyRequests: false` in `cypress.config.ts`, or
2. Check the browser console for "Hidden third-party request:" messages

## Resources

- Links to Specification By Example books
- Links to Cypress best practices and api
- Links to Cucumber/Gherkin docs
