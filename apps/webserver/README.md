# gfw_docker_fargate_pipeline_test

Docker build and pipeline testing for GFW Fargate deployments
Adding stuff

---

## Content Security Policy (CSP) Management

This project uses a strict Content Security Policy (CSP) to protect against XSS and other attacks. The CSP is configured in `src/config/lib/express.ts` using Helmet middleware.

### How to Update the CSP

- When adding new third-party scripts, fonts, images, or APIs, update the relevant CSP directive (e.g., `script-src`, `img-src`, etc.) to whitelist the required domain(s).
- Test all features in staging with the strict CSP enabled to catch issues before production.
- Document any new domains or changes in this section for team awareness.

### Current Whitelisted Domains (script-src)

- 'self'
- https://www.googletagmanager.com
- https://cmp.osano.com
- https://cdn.transifex.com
- https://static.zdassets.com
- https://static.hotjar.com
- https://script.hotjar.com
- https://plausible.io
- https://snap.licdn.com
- https://www.clarity.ms
- https://scripts.clarity.ms
- https://engage.globalforestwatch.org
- https://js.arcgis.com
- 'unsafe-inline', 'unsafe-eval' (required for some legacy or dynamic scripts)

### Best Practices

- Keep this section up to date with all CSP changes.
- Review third-party updates for new domains or resources.
- Encourage developers to update the CSP as part of onboarding new external services.
- Use CSP reporting to monitor and catch violations in production.
