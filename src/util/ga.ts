import ua from 'universal-analytics';
import * as constants from '../common/constants';

const visitor = ua(constants.TRACKING_ID);

export default visitor;
