export const STATUS_CODES = {
  ok: 200,
  notFound: 404,
  created: 201,
  badRequest: 400,
  conflict: 409,
  unauthorized: 401,
  noContent: 204,
};

export const MESSAGES = {
  success: "The operation was successfully completed",
  notFound: "Not found",
  missingFields: "One or more requested fields are missing",
  delete: "Contact deleted",
  emptyBody: "The body of the request is empty",
  missingFavField: "Missing favorite field",
  notAvailable: "Email in use",
  invalidLogin: "Email or passowrd is wrong",
  unauthorized: "Not authorized",
  userNotFound: "User not found",
  verificationPassed: "Verification successful",
  unverified: "Please verify your email before logging in",
  verified: "Verification has already been passed",
  tokenSent: "Verification email sent",
};
