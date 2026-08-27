module.exports = function logger(req, res, next) {
  const path = req.originalUrl;

  res.on('finish', () => {
    const id = req.id ? `[${req.id.slice(0, 8)}] ` : '';
    console.log(`${id}${req.method} ${path} ${res.statusCode}`);
  });

  next();
};