const mongoose = require('mongoose');

const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const EMAIL_REGEX = /^\S+@\S+$/;
const TAG_REGEX = /^(?:[\w-]+)$/;

const TagSchema = mongoose.Schema({
  tagText: {
    type: String,
    required: true,
    validate: {
      function(tagText) {
        return TAG_REGEX.test(tagText);
      },
      message: props => `Please make sure that your tag contains only letters, numbers, hyphens, and underscores`
    }
  }
})


const LinkSchema = mongoose.Schema({
  url: {
    type: String,
    required: true,
    validate: {
      function(url) {
        return URL_REGEX.test(url);
      },
      message: props => `${props.value} is not a valid url`
    }
  },
  title: {
    type: String,
    required: false
  },
  iconUrl: {
    type: String,
    required: false,
    validate: {
      function(url) {
        return URL_REGEX.test(url);
      },
      message: props => `${props.value} is not a valid url`
    }
  },
  toRead: {
    type: Boolean,
    default: true
  }, 
  tags: {
    type: [Tag],
    default: []
  }
})


const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: {
      function(email_address) {
        return URL_REGEX.test(email_address);
      },
      message: props => 'Please enter a valid email address'
    }
  },
  hashed_password: {
    type: String,
    required: true
  },
  tags: {
    type: [TagSchema],
    default: []
  },
  links: {
    type: [LinkSchema],
    default: []
  },
  create_time: {
    type: Date,
    default: new Date()
  }
})


module.exports = mongoose.model('User', UserSchema);