import morgan from 'morgan';
import { config } from './config.js';
export const httpLogger = morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev');