// Centralized error handler → always { message } (+ errors[] for validation)
export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors;

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = errors[0];
  } else if (err.code === 11000 || err.code === '23505') {
    status = 409;
    message = 'An account with this email already exists.';
  } else if (err.name === 'CastError' || err.code === '22P02') {
    status = 400;
    message = 'Invalid ID or value format.';
  } else if (err.code === '23514') {
    status = 400;
    message = 'Invalid field value.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body.';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message, ...(errors ? { errors } : {}) });
}

export const httpError = (status, message) => Object.assign(new Error(message), { status });
