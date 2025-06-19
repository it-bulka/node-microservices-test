require('dotenv').config()
const express = require('express');
const app = express();
const router = express.Router();
const logger = require('./utils/logger');
const proxy = require('express-http-proxy')
const { notFound } = require('./middleware/notFound')
const { errorHandler } = require('./middleware/errorHandler')
const { authMiddleware } = require('./middleware/authMiddleware');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const proxyOptions = {
  proxyReqPathResolver: (req, res) => {
    const newPath = req.originalUrl.replace('\/v1/', '\/api/v1/')
    logger.info(`Proxying ${req.method} ${req.originalUrl} → ${newPath}`);
    return newPath
  },
  proxyErrorHandler: (err, res, next) => {
    logger.warn('Proxy error occurred', err);

    return res.status(500).json({
      error: err.message,
      message: 'Internal Server Error'
    });
  }
}

app.get('/', (req, res) => {
  res.send('SUCCESS')
})

app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (opts, srcReq) => {
    opts.headers['Content-Type'] = 'application/json';
    return opts
  },
  userResDecorator: (proxyRes, proxyResData, req, res) => {
    logger.info('Response received from Identity-Server', proxyRes.statusCode);
    return proxyResData
  }
}))

app.use('/v1/posts', authMiddleware, proxy(process.env.POST_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (opts, srcReq) => {
    opts.headers['Content-Type'] = 'application/json';
    opts.headers['x-user-id'] = srcReq.user.userId;

    return opts
  },
  userResDecorator: (proxyRes, proxyResData, req, res) => {
    logger.info('Response received from Post-Server', proxyRes.statusCode);
    return proxyResData
  }
}))

app.use('/v1/medias', authMiddleware, proxy(process.env.MEDIA_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (opts, srcReq) => {
    opts.headers['x-user-id'] = srcReq.user.userId;

    return opts
  },
  userResDecorator: (proxyRes, proxyResData, req, res) => {
    logger.info('Response received from Media Service', proxyRes.statusCode);
    return proxyResData
  }
}))

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
  logger.info(`Identity service is listening on the uri: ${process.env.IDENTITY_SERVICE_URL}`);
  logger.info(`Post service is listening on the uri: ${process.env.POST_SERVICE_URL}`);
  logger.info(`Media service is listening on the uri: ${process.env.MEDIA_SERVICE_URL}`);
});