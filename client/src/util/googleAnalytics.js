import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'crowdy',
  version: 1,
  plugins: [
    googleAnalyticsPlugin({
      trackingId: 'UA-120727651-10',
    }),
  ]
})


export default analytics;

