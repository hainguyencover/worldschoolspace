exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate key error",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
