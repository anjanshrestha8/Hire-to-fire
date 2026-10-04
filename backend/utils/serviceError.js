class ServiceError extends Error {
  constructor(statusCode, body) {
    const message =
      typeof body === "string"
        ? body
        : body?.error || body?.message || "Service error";
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
    this.body = typeof body === "string" ? { error: body } : body;
  }
}

module.exports = ServiceError;
