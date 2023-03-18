// require and set config before test
const config = require('../config');
config.TEST = true;

const {ExpressError, DuplicateUsernameError, DuplicateEmailError, UnauthorizedError} = require('../expressError')
const User = require('./User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const testUserDoc = {
  username: "testuser",
  email: "testuser@aol.com",
  hashed_password: "gargh;fagowrhg3",
  // tags,
  // links
}

const unhashedTestUserDoc = {
  username: "unhasheduser",
  email: "uhasheduser@hackme.com",
  password: "password",
  // tags,
  // links
}



beforeAll(async() => {
  try {
    const dbstring = 'mongodb://127.0.0.1:27017';
    const options =  {
      dbName: 'ReadingList'
    }
    await mongoose.connect(dbstring, options);
    let usersToDelete = await Promise.all([
      User.findOne({username: "testuser"}),
      User.findOne({username: "unhasheduser"})
    ]);
    await Promise.all(usersToDelete.map(user => user.remove()))
  } catch(err) {
    console.log(err);
  }
})

afterAll(async() => {
  await mongoose.disconnect();
})

describe("smoke test", function() {

  test("doesn't blow up", function() {
    // just don't throw an error
  })
})


describe("Creates User", function() {
  test("Creates and saves a valid User", async function() {
    let user = new User(testUserDoc)
    await user.save();
  })
})


describe("Creates User using schema method", function() {
  test("Creates and saves a valid User with User.createAndSave", async function(){
    const {username, email, password} = unhashedTestUserDoc
    let savedUser = await User.createAndSave(username, email, password);
    console.log(savedUser);
    expect(savedUser.hashed_password).not.toBe('password');
    expect(savedUser.username).toBe('unhasheduser')
  })

  test("Fails on invalid User", async function() {
    const badPromise = User.createAndSave("baduser", "invalidemail", "password")
    await expect(badPromise)
    .rejects
    .toThrow("User validation failed: email: Please enter a valid email address")

    // check constructor, already awaited
    expect(badPromise).rejects.toThrow(ExpressError);
  })

  test("Fails on duplicate username", async function() {
    const {username, email, password} = unhashedTestUserDoc;
    const badPromise = User.createAndSave(username, email, password)
    await expect(badPromise)
    .rejects
    .toThrow("Cannot create user, a user with that username already exists")

    // check constructor, already awaited
    expect(badPromise).rejects.toThrow(DuplicateUsernameError)
  })


  test("Fails on duplicate email", async function() {
    const {email, password} = unhashedTestUserDoc;
    const badPromise = User.createAndSave("validusername", email, password)
    await expect(badPromise)
    .rejects
    .toThrow("Cannot create user, a user with that email address already exists")

    // check constructor, already awaited
    expect(badPromise).rejects.toThrow(DuplicateEmailError)
  })

})


describe("Successfully logs in", function() {
  test("Valid credentials return user and token", async function(){
    const {username, email, password} = unhashedTestUserDoc;
    const loggedIn = await User.login(username, password);
    expect(loggedIn.user.username).toBe(username);
    expect(loggedIn.user.email).toBe(email);
    expect(jwt.decode(loggedIn.token).id).toBe(loggedIn.user.id);
    expect(loggedIn.user).toHaveProperty('hashed_password');
    
  })

  test("Wrong password returns 'Invalid Credentials' error", async function(){
    const username = unhashedTestUserDoc.username;
    const password = 'wrongpassword'
    await expect(User.login(username, password)).rejects.toThrow("Invalid Credentials")
  })

  test("Invalid username returns 'Invalid Credentials' error", async function(){
    const username = 'invaliduser';
    const password = 'wrongpassword'
    await expect(User.login(username, password)).rejects.toThrow("Invalid Credentials")
  })

  test("Safe Login returns same object but with no hashed_password", async function(){
    const {username, email, password} = unhashedTestUserDoc;
    const loggedIn = await User.safeLogin(username, password);
    expect(loggedIn.user.username).toBe(username);
    expect(loggedIn.user.email).toBe(email);
    expect((jwt.decode(loggedIn.token)).id).toBe(String(loggedIn.user._id));
    expect(loggedIn.user).not.toHaveProperty('hashed_password');
  })

})


describe("Successfully authenticates a valid token", function(){

  test("Returns user on valid token", async function() {

    const {username, email, password} = unhashedTestUserDoc;
    const loggedIn = await User.login(username, password);

    const token = loggedIn.token;
    const user = await User.authenticate(token);
    expect(user.username).toBe(username);
  })


  test("Throws UnauthorizedError ('Invalid Token') on valid token with invalid ObjectId", async function() {
    const badToken = "badtoken";
    await expect(User.authenticate(badToken)).rejects.toThrow("Invalid Token")
  })

  test("Throws UnauthorizedError ('Invalid User') on valid token with invalid user", async function(){
    const badToken = jwt.sign({id: mongoose.Types.ObjectId().toString()}, process.env.SECRET_KEY);
    await expect(User.authenticate(badToken)).rejects.toThrow("Invalid User")  
  })
})