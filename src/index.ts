import express from 'express';
import http from 'http';
import path from 'path';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import GoogleMap from './util/googleMap';
import Logger from './common/logger';

const swaggerDocument = YAML.load('./swagger.yaml');
const log = Logger.createLogger('index');
const app = express();
const server = new http.Server(app);

// Serve static files from the React app
app.use(express.static(path.join('client/build')));

app.get('/api/health', (req, res) => {
  res.send('Healthy');
});

app.get('/api/locations', async (req, res) => {
  const latitude = (req.query.latitude) ? Number(req.query.latitude) : undefined;
  const longitude = (req.query.longitude) ? Number(req.query.longitude) : undefined;
  const category = String(req.query.category);
  log.debug(`[+] request to get locations <category: ${category} latitude: ${latitude}, longitude: ${longitude}>`);
  try {
    const locationInfoList = await GoogleMap.getLocationInfoList(
      category, latitude, longitude,
    );
    log.debug(`[+] succeeded to get locations <category: ${category} latitude: ${latitude}, longitude: ${longitude}>`);
    res.send({ statusCode: '0', locationInfoList });
  } catch (error) {
    log.error(`[-] failed </api/locations> - ${error}`);
    res.send({ statusCode: '-1' });
  }
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (_, res) => {
  res.sendFile(path.join('/client/build/index.html'));
});


const port = process.env.PORT || 80;
server.listen(port, () => log.info(`Crowdy app listening on port ${port}!`));
