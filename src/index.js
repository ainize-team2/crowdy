
const GoogleMap = require('./util/googleMap');
const analytics = require('./util/googleAnalytics');

const express = require('express')
const app = express();
const server = require('http').Server(app);
const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join('client/build')));

app.get('/api/health', (req, res) => {
  res.send('Healthy');
});

app.get('/api/locations', async (req, res) => {
  const { latitude, longitude, category } = req.query;
  try {
    const locationInfoList = await GoogleMap.getLocationInfoList(latitude, longitude, category);
    console.log({ locationInfoList })
    res.send({ locationInfoList });
  } catch (error) {
    console.log(error)
    res.send({});
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (_, res) => {
  res.sendFile(path.join('/client/build/index.html'));
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Crowdy app listening on port ${port}!`));
