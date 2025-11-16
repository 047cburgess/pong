// On failure, returns a (possibly empty) string array of errors. Otherwise null
export type FieldValidator = (value: string) => string[] | null;

export const usernameValidator: FieldValidator = (username) => {
  const errors = [];

  if (username.length === 0) {
    errors.push("Username cannot be empty");
  } else if (username.length < 3) {
    errors.push("Username too short");
  }
  if (username.length > 20) {
    errors.push("Username too long");
  }

  if (!username.match(/^[a-zA-Z0-9_]+$/)) {
    errors.push("Invalid characters");
  }

  if (errors.length) {
    return errors;
  }
  return null;
};

export const passwordValidator: FieldValidator = (password) => {
  const errors: string[] = [];

  if (password.length <= 7) {
    errors.push("Password too short");
  }

  if (password === "password") {
    errors.push("This password already exists in our database");
    errors.push("Just kidding");
    errors.push("But maybe try something more original?");
  }

  if (errors.length) {
    return errors;
  }
  return null;
};

export const emailValidator: FieldValidator = (email) => {
  if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    return ["Invalid email"];
  }
  return null;
};
