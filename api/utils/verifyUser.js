// this is used to verify the user token before accessing the user route from the cookie and jwt token temporarily stored in the cookie of browser 

import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';


export const verifyToken = (req, res, next) => {
  // get the token from the cookie from the browser   
  const token = req.cookies.access_token;

  // if there is no token then return the error message using middleware error handler created in the error.js file
  if (!token) return next(errorHandler(401, 'Unauthorized'));

  // verify the token using the jwt.verify method and the secret key from the .env file that is used to sign the token 
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // if there is an error then return the error message using middleware error handler created in the error.js file
    if (err) return next(errorHandler(403, 'Forbidden'));

    // if there is no error then set the user to the user object and call the next middleware
    req.user = user;
    // call the next middleware
    next();
  });
};
