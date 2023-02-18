class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}


class UnauthorizedError extends ExpressError {
  constructor(message="Unauthorized") {
    super(message, 401);
  }
}