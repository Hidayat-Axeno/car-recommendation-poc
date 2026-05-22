'use strict';

/**
 * Wraps async route handlers so errors are forwarded to Express error middleware.
 * Keeps controllers free of try/catch boilerplate.
 */
const asyncWrap = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrap;
