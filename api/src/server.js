import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'api/auth/passport';
import HttpRoutes from 'api/routes/HttpRoutes';
import logger from 'lib/logger';
import { install } from 'source-map-support';

install();

process.on('SIGINT', () => {
  process.exit(0);
});
const corsMiddleware = cors({ origin: '*', preflightContinue: true });
const app = express();
app.use(corsMiddleware);
app.options('*', corsMiddleware);

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

const pathPrefix = process.env.PATH_PREFIX || ''; /* use leading slash */
app.use(pathPrefix, HttpRoutes);

if (process.env.API_PORT) {
  app.listen(process.env.API_PORT, (err) => {
    if (err) {
      logger.error(err);
    }
    logger.info(
      '\n --- \n',
      `==> 🌎  API is running on port ${process.env.API_PORT}`,
      '\n',
      `==> 💻  Send requests to http://${process.env.API_HOST}:${process.env.API_PORT}${pathPrefix}/`,
      '\n',
      '--- \n'
    );
    if (process.send) process.send('ready');
  });
} else {
  logger.error(
    '==>     ERROR: No PORT environment variable has been specified'
  );
}
export default app;
