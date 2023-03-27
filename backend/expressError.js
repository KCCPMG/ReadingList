class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

// 400 messages
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

class InvalidTagError extends BadRequestError {
  constructor(message="Please make sure that your tag contains only letters, numbers, hyphens, and underscores") {
    super(message);
  }
}


class DuplicateTagError extends BadRequestError {
  constructor(message="A tag with this text already exists") {
    super(message);
  }
}

class DuplicateLinkError extends BadRequestError {
  constructor(message="You already have a link saved with this url") {
    super(message);
  }
}

// 401 messages
class UnauthorizedError extends ExpressError {
  constructor(message="Unauthorized") {
    super(message, 401);
  }
}

module.exports = {
  ExpressError, 
  DuplicateUsernameError, 
  DuplicateEmailError, 
  InvalidTagError,
  DuplicateTagError, 
  UnauthorizedError
}
