const { assert } = require('chai');

const { lookupUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = lookupUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user.id);
  });
  it('should return false if the email is invalid', function() {
    const user = lookupUserByEmail("userrrr@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(false, user);
  });
});