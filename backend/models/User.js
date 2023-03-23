const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const {UnauthorizedError, DuplicateUsernameError, DuplicateEmailError, ExpressError, DuplicateTagError} = require('../expressError');

// Regular expressions for validating input
const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const EMAIL_REGEX = /^\S+@\S+$/;
const TAG_REGEX = /^(?:[\w-]+)$/;


// dotenv for SECRET_KEY needed for passwords
dotenv.config({
  path: './.env'
})

// salt and hash for bcrypt
const SALT_ROUNDS = config.TEST ? 1: 12;
const SALT = bcrypt.genSaltSync(SALT_ROUNDS);


const TagSchema = new mongoose.Schema({
  tagText: {
    type: String,
    required: true,
    unique: false,
    validate: {
      validator: function(tagText) {
        return TAG_REGEX.test(tagText);
      },
      message: () => "Please make sure that your tag contains only letters, numbers, hyphens, and underscores"
    }
  }
}, {
  statics: {
    /**
     * 
     * @param {*} tagText 
     * @returns {Tag}
     * Creates and saves a tag with just tagText. Does 
     * NOT check for duplicates 
     */
    async createAndSave(tagText) {
      try {
        const doc = await this.create({
          tagText
        })
        await doc.save();
        return doc;
      } catch(err) {
        throw new ExpressError(err.message);
      }
    } 
  }
})

const Tag = mongoose.model('Tag', TagSchema);

const LinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(url) {
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
      validator: function(url) {
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
    type: [mongoose.Types.ObjectId],  // ObjectId of tags
    default: []
  }
})

const Link = mongoose.model('Link', LinkSchema);


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(email_address) {
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
  },
}, {
  statics: {
    /**
     * 
     * @param {String} username 
     * @param {String} email 
     * @param {String} password 
     * @returns {User}
     * Creates user from username, email, and password,
     * by hasing password and using own create method
     */
    async createAndSave(username, email, password) {
      try {
        // replace password with hashed_password
        const hashed_password = bcrypt.hashSync(password, SALT)

        const doc = await this.create({
          username,
          email,
          hashed_password
        });

        await doc.save();
        return doc;
      } catch(err) {
        if (err.message.startsWith("E11000 duplicate key error collection: ReadingList.users index: username_1")) {
          throw new DuplicateUsernameError();
        }
        else if (err.message.startsWith("E11000 duplicate key error collection: ReadingList.users index: email_1")) {
          throw new DuplicateEmailError();
        } 
        else throw new ExpressError(err.message, 400);
      }
    },
    /**
     * 
     * @param {String} username 
     * @param {String} password 
     * @returns {{user: User, token: String}}
     * Finds user with username, compares given password
     * to hashed_password using bcrypt, if match, returns
     * an object with the user and a token. If no match,
     * throws UnauthorizedError with "Invalid Credentials"
     * message. NOTE: THE USER THAT IS RETURNED HERE INCLUDES
     * THE HASHED_PASSWORD, AND NEEDS TO BE REMOVED
     */
    async login(username, password) {
      try {
        let user = await this.findOne({username});
        if (!user) throw new UnauthorizedError("Invalid Credentials");
        if (bcrypt.compareSync(password, user.hashed_password)) {
          return {
            user,
            token: jwt.sign({
              id: user._id
            }, process.env.SECRET_KEY)
          }
        } else {
          throw new UnauthorizedError("Invalid Credentials");
        }
      } catch(err) {
        throw err;
      }
    },
    /**
     * 
     * @param {String} username 
     * @param {String} password 
     * @returns {{user: User, token: String}}
     * Wrapper function for login to remove the hashed password
     * from the returned user object
     */
    async safeLogin(username, password) {
      try {
        const loggedInUser = await this.login(username, password);
        loggedInUser.user = loggedInUser.user.toObject();
        delete loggedInUser.user.hashed_password;
        return loggedInUser;
      } catch(err) {
        throw(err);
      }
    },
    async logout() {

    },
    /**
     * 
     * @param {*} token 
     * @returns {User}
     * 
     * Takes a token, verifies it to get a userId,
     * takes the userId to get the appropriate User
     * If there is an error with the token, throws
     * an UnauthorizedError with "Invalid Token".
     * If there is an error with finding the User, 
     * throws an UnauthorizedError with "Invalid User"
     */
    async authenticate(token) {
      try {
        const userId = jwt.verify(token, process.env.SECRET_KEY).id;
        const user = await this.findById(userId);
        if (!user) {
          throw new UnauthorizedError("Invalid User");
        } else return user;
        
      } catch(err) {
        if (err.name === 'JsonWebTokenError') {
          throw new UnauthorizedError("Invalid Token");
        } else if (err.name==="CastError") {
          throw new UnauthorizedError("Invalid User");
        }
        else throw err;
      }
    }
  },
  methods: {
    async addLink(url, title, iconUrl, tags) {
      try {
        let tagIds = [];
        let addTagPromises = [];
        for (let tag of tags) {
          let tagObj = this.tags.find(t => t.text === tag);
          if (tagObj) {
            tagIds.push(tagObj._id);
          } else {
            addTagPromises.push()
          }
        }
        await Promise.all(addTagPromises).then(tags => {
          tags.forEach(t => {
            tagIds.push(t._id);
          })
        })
        // make sure link does not already exist
        let link = await Link.createAndSave(url, title, iconUrl, tagIds);
        this.links.push(link);
        
      } catch(err) {
        console.log(err);
      }
      
    },
    /**
     * 
     * @param {*} tagText 
     * @returns {User}
     * Given a tagText string, checks for a duplicate
     * within the User's tags, and if not, calls the 
     * Tag method for creation, pushes the tag to the User's
     * tags, saves, and returns the modified User
     */
    async addTag(tagText) {
      try {
        //check for duplicates
        if (this.tags.find(t => t.tagText === tagText)) {
          throw new DuplicateTagError();
        }
        let tag = await Tag.createAndSave(tagText);
        this.tags.push(tag);
        await this.save();
        return this;
      } catch(err) {
        if (err instanceof ExpressError) throw err;
        else throw new ExpressError(e.message);
      }
    },
    deleteTag() {},
  }
})




module.exports = mongoose.model('User', UserSchema);