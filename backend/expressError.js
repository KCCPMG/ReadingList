class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

class BadRequestError extends ExpressError {
  constructor(message="Bad Request") {
    super(message, 400)
  }
}

class DuplicateUsernameError extends BadRequestError {
  constructor(message="Cannot create user, a user with that username already exists") {
    super(message);
  }
}

class DuplicateEmailError extends BadRequestError {
  constructor(message="Cannot create user, a user with that email address already exists") {
    super(message);
  }
}


class UnauthorizedError extends ExpressError {
  constructor(message="Unauthorized") {
    super(message, 401);
  }
}

module.exports = {ExpressError, DuplicateUsernameError, DuplicateEmailError, UnauthorizedError}