import express from 'express';
import http from 'http';
import path from 'path';
import GoogleMap from './util/googleMap';
import Logger from './common/logger';

const log = Logger.createLogger('index');

const app = express();
const server = new http.Server(app);

// Serve static files from the React app
app.use(express.static(path.join('client/build')));

app.get('/api/health', (req, res) => {
  res.send('Healthy');
});

app.get('/api/locations', async (req, res) => {
  const latitude = String(req.query.latitude);
  const longitude = String(req.query.longitude);
  const category = String(req.query.category);
  const zoom = String(req.query.zoom);

  try {
    const locationInfoList = await GoogleMap.getLocationInfoList(
      category, latitude, longitude, zoom,
    );

    log.debug(JSON.stringify(locationInfoList[0]));
    res.send({ locationInfoList });
  } catch (error) {
    log.error(`[-] failed </api/locations> - ${error}`);
    res.send({ statusCode: '-1' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (_, res) => {
  res.sendFile(path.join('/client/build/index.html'));
});

const port = process.env.PORT || 5000;
server.listen(port, () => log.info(`Crowdy app listening on port ${port}!`));
