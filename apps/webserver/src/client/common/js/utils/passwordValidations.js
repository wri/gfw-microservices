
// Must be between 10 and 128 Characters
const isPasswordLengthValid = (password) => {
  return (password.length >= 10 && password.length <= 128) ? true : false;
};

// Has numeric character
const hasNumeric = (password) => {
  const regex = /\d/;
  return regex.test(password);
};

// Has uppercase character
const hasUppercase = (password) => {
  const regex = /[A-Z]/;
  return regex.test(password);
};

// Has lowercase character
const hasLowercase = (password) => {
  const regex = /[a-z]/;
  return regex.test(password);
};

// Has special character
const hasSpecialCharacter = (password) => {
  // Valid Cognito special characters: ^ $ * . [ ] { } ( ) ? - " ! @ # % & / \ , > < ' : ; | _ ~ `
  const regex = /[\^\$\*\.\[\]\{\}\(\)\?\-\"\!\@\#\%\&\/\\\,\>\<\'\:\;\|\_\~\`]/;
  return regex.test(password);
};

const threeOfFour = (arry) => {
  if (arry.length === 4) {
    let validCounter = 0;
    for (let i = 0; i < arry.length; i++) {
      if (arry[i]) { validCounter += 1; }
    }
    return validCounter >= 3 ? true : false;
  }
  else { return false; }
};

// Has consecutive characters
const hasConsecutiveCharacters = (password) => {
  const regex = /(.)\1{1,}/;
  return regex.test(password);
};

// Matches Username
const isMatchingUsername = (username, password) => {
  return username === password ? true : false;
};

export const isPasswordValid = (username, password) => {
  const length = isPasswordLengthValid(password);
  const characterValidation = threeOfFour([hasNumeric(password), hasUppercase(password), hasLowercase(password), hasSpecialCharacter(password)]);
  const consecutive = hasConsecutiveCharacters(password);
  const usernameMatch = isMatchingUsername(username, password);

  return length && characterValidation && !consecutive && !usernameMatch;
};
