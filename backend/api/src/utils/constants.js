export const isDev = process.env.NODE_ENV === "development" ? true : false;

export const accessTokenOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 15 * 60 * 1000,
  path: "/"
};