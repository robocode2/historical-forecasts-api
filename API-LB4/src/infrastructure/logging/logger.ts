require('dotenv').config();
import fs from 'fs';
import _ from 'lodash';
import pino, {StreamEntry, multistream} from 'pino';
import pretty from 'pino-pretty';

const streams: StreamEntry[] = [];

streams.push({
  stream: pretty({
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'hostname,pid' // add 'time' to remove timestamp
  })
});

if (!_.isNil(process.env.SCRIPT_LOG)) {
  streams.push({stream: fs.createWriteStream(process.env.SCRIPT_LOG)});
}

const pinoOptions = {
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  customLevels: {
    info: 30,
    warn: 40,
    error: 50
  },
  useOnlyCustomLevels: true
};

const logger = pino(pinoOptions, multistream(streams, {dedupe: true}));

export {logger};

