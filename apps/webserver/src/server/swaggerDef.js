const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const app = express();

app.use(
  bodyparser.json({
    strict: false,
  })
);

// -- setup up swagger-jsdoc --
const swaggerDefinition = {
  info: {
    title: 'GFW Pro API',
    version: '1.0.0',
    description: 'GFW Pro API documentation',
  },
  host: 'https://localhost:8443',
  basePath: '/',
};
const options = {
  swaggerDefinition,
  apis: [path.resolve(__dirname, 'server.js')],
};
const swaggerSpec = swaggerJSDoc(options);

// -- routes for docs and generated swagger spec --

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
