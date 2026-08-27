/**
 * requestId middleware  [mount GLOBALLY in app.js]
 *
 * TODO: export a middleware function (req, res, next) that:
 *   - generates a UUID with crypto.randomUUID()
 *   - attaches it to req.id
 *   - sets it as the "X-Request-Id" response header
 *   - calls next()
 */

const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
  const id = randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);

  next();
};