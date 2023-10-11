# Notes : WIP

## Example response for create API key and add to plan request.

Create API key response body:

```
{
  id: 'd3grev7wa4',
  value: 'HkIXacIxu73fo9T3EfRaP9OnUryUCLOV8WO87oIL',
  name: 'externalapi',
  enabled: true,
  createdDate: 2023-09-07T12:45:41.000Z,
  lastUpdatedDate: 2023-09-07T12:45:41.000Z,
  stageKeys: []
}
```

Add API key to plan response body:

```
{
  id: 'd3grev7wa4',
  type: 'API_KEY',
  value: 'HkIXacIxu73fo9T3EfRaP9OnUryUCLOV8WO87oIL',
  name: 'externalapi'
}
```
## Configuration
Check env.example for required environment variables.