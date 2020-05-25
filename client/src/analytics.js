import ReactGA from 'react-ga';

const trackingId = "UA-164242824-3"; 
const CHECK_USE_TIME = 30000;
ReactGA.initialize(trackingId);

setTimeout(() => {
  ReactGA.event({
    category: 'spotainize_common',
    action: 'used_30s'
  })
}, CHECK_USE_TIME);

export default ReactGA;