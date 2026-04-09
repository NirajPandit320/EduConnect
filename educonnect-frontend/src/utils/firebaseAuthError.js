const AUTH_ERROR_MESSAGES = {
  "auth/user-not-found": "User not found",
  "auth/wrong-password": "Incorrect password",
  "auth/email-already-in-use": "Email already registered",
  "auth/invalid-email": "Invalid email address",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/too-many-requests": "Too many attempts. Please try again later",
};

export const getFirebaseAuthErrorMessage = (error) => {
  const code = error?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  return "Unable to complete authentication. Please try again";
};
