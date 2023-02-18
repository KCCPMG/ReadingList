const mongoose = require('mongoose');

const User = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: mongoose.Types.email,
    required: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  links: {
    type: [],
    default: []
  },
  create_time: {
    type: Date,
    default: new Date()
  }
})


module.exports = mongoose.model(User);