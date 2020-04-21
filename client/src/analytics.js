import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

const analytics = Analytics({
  app: 'crowdy',
  version: 1,
  plugins: [
    googleAnalytics({
      trackingId: 'UA-120727651-10',
    }),
  ]
})

export default analytics;