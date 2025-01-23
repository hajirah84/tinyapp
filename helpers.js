const getUserByEmail = function(email, database) { //iterate through database to find a user with a matching email
    for (const userId in database) {
      const user = database[userId];
      if (user.email === email) {
        return user; 
      }
    }
    return null; //return null if no user with the provided email is found
  };
  
  module.exports = { getUserByEmail };
  