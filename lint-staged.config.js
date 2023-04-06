module.exports = {
  '{packages,tools}/**/*.{ts, js, json, md}':[
    'nx affected --target lint --uncommitted --fix true',
    'nx affected --target test --uncommitted',
    'nx format:write --uncommitted',
  ]
}
