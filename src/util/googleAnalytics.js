const { Analytics } = require('analytics')
const { init } = require('@analytics/google-analytics');

const analytics = Analytics({
  app: 'crowdy',
  version: 1,
  plugins: [
    init({
      trackingId: 'UA-120727651-10',
    }),
  ]
})

module.exports = analytics;