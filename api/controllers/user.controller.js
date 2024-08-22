import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};


export const updateUser = async (req, res, next) => {
  // check if the user is updating their own account - req.prams.id is the id of the user that is being updated and req.user.id is the id of the user that is logged in
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

// delete user by id
export const deleteUser = async (req, res, next) => {
  // check if the user is deleting their own account - req.prams.id is the id of the user that is being deleted and req.user.id is the id of the user that is logged in
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    // delete the user by id in the model we created in the user.model.js file by finding the user by id and deleting it
    await User.findByIdAndDelete(req.params.id);
    // clear the cookie from the browser before the user is deleted
    res.clearCookie('access_token');
    // return the message to the client that the user has been deleted
    res.status(200).json('User has been deleted!');

  } catch (error) {
    next(error);
  }
};


// get all listings of a user by id - the user can only view their own listings
export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      // find all the listings of a user by id in the model we created in the listing.model.js file
      const listings = await Listing.find({ userRef: req.params.id });
      // when found return the listings to the client
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

// get user by id - the user can only view their own account information 
export const getUser = async (req, res, next) => {
  try {
    // find the user by id in the model we created in the user.model.js file
    const user = await User.findById(req.params.id);
    // if the user is not found then return the error message using the error handler middleware
    if (!user) return next(errorHandler(404, 'User not found!'));
    // if the user is found then return the user information to the client
    const { password: pass, ...rest } = user._doc;
    
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
