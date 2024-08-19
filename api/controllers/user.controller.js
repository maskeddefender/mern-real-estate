import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};


export const updateUser = async (req, res, next) => {
  // check if the user is updating their own account
  if (req.user.id !== req.params.id)
    // if the user is not updating their own account then return the error message using the error handler middleware
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    // if the user is updating their own account then check if the user is updating the password
    if (req.body.password) {
      // if the user is updating the password then hash the password using bcryptjs
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // update the user by id in the model we created in the user.model.js file
    const updatedUser = await User.findByIdAndUpdate(
      // find the user by id
      req.params.id,
      // update the user information as per the input from the user
      {
        // set is going to set the new information to the user iff it is provided by the user else it will keep the old information
        $set: {
          // specify the fields that can be updated by the user - username, email, password, avatar
          // dont ude req.body directly as it can be used to update any field in the user model which may not be allowed or should not be updated by the user
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      // save and return the updated user information
      { new: true }
    );

    // return the updated user information - separate the password from the user information before sending it to the client
    const { password, ...rest } = updatedUser._doc;

    // return the updated user information to the client
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};