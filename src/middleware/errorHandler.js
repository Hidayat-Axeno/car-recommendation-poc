'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);

  const status  = err.status || 500;
  const message = status < 500 ? err.message : 'Internal server error';

  return res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
