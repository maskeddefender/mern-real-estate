import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs'; // to hash the password before saving it to the database so that it cannot be read by anyone
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken'; // to sign in the user using the jwt token


// get the information from the browser when the user is signing up, this is coming from the body of the request
export const signup = async (req, res, next) => {

    // to save the content from the body to the variables 
    // this gives us the flexibility to change the details of the variables in the future
    const { username, email, password } = req.body;
    // hash the password before saving it to the database - hashSync means wait for the password to be hashed before saving it to the database
    // the 10 is the number of times the password is hashed
    const hashedPassword = bcryptjs.hashSync(password, 10);
    // creating the information to the database using the model we created in the models (user) folder
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        // save the information to the database
        await newUser.save() // as the .save takes some time to save the information to the database, we use the async and await to wait for the information to be saved before we send the response
        res.status(201).json('User created successfully');
    } catch (error) {
        // if there is an error, we send the error to the next middleware to handle the error 
        next(error);
    }
}

// get the information from the browser when the user is signing in, this is coming from the body of the request
export const signin = async (req, res, next) => {
    // getting the email and password from the body of the request
    const { email, password } = req.body;
    try {
      // find the user from the database using the email - findOne is a mongoose method to find the user using the email - from the model we have created in the models folder      
      const validUser = await User.findOne({ email });
      if (!validUser) return next(errorHandler(404, 'User not found!'));
      // compare the password from the database and the password from the body of the request
      // compareSync is a bcryptjs method to compare the password from the database and the password from the body of the request
      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));
      // if the password is correct, then we sign in the user using the jwt token
      // creating a token and using its sign method to sign in the user using the id of the user and the secret key from the .env file
      const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
      // destructuring the password from the user object so that the password is not sent to the browser
      // but all rest of the information is sent to the browser
      const { password: pass, ...rest } = validUser._doc; // _doc is the document of the user which is saved in the database
      // after creating the token saving it to the cookie and sending the response to the browser
      res
        // cookie method to save the token to the cookie - it is used for authentication or authorization
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest); // sending the rest of the information to the browser except the password
    } catch (error) {
      next(error);
    }
  };

  