export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  if (status >= 500) {
    console.error("Unhandled API error:", err);
  }

  return res.status(status).json({
    success: false,
    message: err?.message ?? "Unexpected server error"
  });
}
