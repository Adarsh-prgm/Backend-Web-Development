module.exports = function timing(req, res, next) {
  const start = Date.now();
  const path = req.originalUrl;

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const id = req.id ? `[${req.id.slice(0, 8)}] ` : '';

    console.log(`${id}${req.method} ${path} took ${elapsed}ms`);
  });

  next();
};