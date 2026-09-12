/**
 * Cookie carrying the role picked on the signup page through the OAuth
 * round-trip: `signIn()` from next-auth/react drops unknown options, so the
 * role can't be passed along with the sign-in request itself.
 */
export const OAUTH_SIGNUP_ROLE_COOKIE = "oauth_signup_role";
