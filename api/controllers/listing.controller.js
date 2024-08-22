import { model } from 'mongoose';
import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

// createListing - is a function that creates a new listing
export const createListing = async (req, res, next) => {
  try {
    // create a new listing using the Listing model and the request body - await for the response from mongoDB
    // Listing is the model created in the listing.model.js
    const listing = await Listing.create(req.body);
    // return the response status 201 and the listing
    return res.status(201).json(listing);
    // error iff present is handled by the redux middleware
  } catch (error) {
    next(error);
  }
};

// deleteListing - is a function that deletes a listing
export const deleteListing = async (req, res, next) => {
  // find the listing by id - await for the response from mongoDB - if it exists or not
  const listing = await Listing.findById(req.params.id);
  // if the listing does not exist return an error                        
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  // if it exists check if the user id is the same as the listing userRef - user is the owner of the listing
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }
  // if the user is the owner of the listing delete the listing
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
    // error iff present is handled by the redux middleware
  } catch (error) {
    next(error);
  }
};

// updateListing - is a function that updates a listing - edit the listing
export const updateListing = async (req, res, next) => {
  // find the listing by id - await for the response from mongoDB - if it exists or not
  const listing = await Listing.findById(req.params.id);
  // if the listing does not exist return an error
  if (!listing) {

    return next(errorHandler(404, 'Listing not found!'));
  }
  // if it exists check if the user id is the same as the listing userRef - user is the owner of the listing
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }
  // if the user is the owner of the listing update the listing with the new request body
  try {

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id, // find the listing by id
      req.body, // update the listing with the new request body
      { new: true } // return the updated listing
    );
    // return the response status 200 and the updated listing
    res.status(200).json(updatedListing);
    // error iff present is handled by the redux middleware
  } catch (error) {
    next(error);
  }
};

// getListing - is a function that gets a listing - information about the listing from the database when the user clicks on the listing
export const getListing = async (req, res, next) => {
  // find the listing by id - await for the response from mongoDB - if it exists or not
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    // return the response status 200 and the listing information when the listing is found
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

// getListings - is a function that gets a list of all the listings - this is for searching listings
export const getListings = async (req, res, next) => {
  try {
    // get the limit of the listings to be displayed - default is 9
    const limit = parseInt(req.query.limit) || 9;
    // get the start index of the listings to be displayed - default is 0
    const startIndex = parseInt(req.query.startIndex) || 0;
    // get the offer of the listings to be displayed - default is false
    let offer = req.query.offer;
    // if the offer is undefined or false set the offer to be an array of false and true
    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] }; // $in is a mongoDB operator that selects the documents where the value of a field equals any value in the specified array
    }

    // get the furnished of the listings to be displayed - default is false
    let furnished = req.query.furnished;
    // if the furnished is undefined or false set the furnished to be an array of false and true
    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] }; // $in is a mongoDB operator that selects the documents where the value of a field equals any value in the specified array
     }

    // get the parking of the listings to be displayed - default is false
    let parking = req.query.parking;
    // if the parking is undefined or false set the parking to be an array of false and true
    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    // get the type of the listings to be displayed - default is all
    let type = req.query.type;
    // if the type is undefined or all set the type to be an array of sale and rent
    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    // get the search term of the listings to be displayed - default is empty
    const searchTerm = req.query.searchTerm || '';

    // get the sort of the listings to be displayed - default is createdAt
    const sort = req.query.sort || 'createdAt';

    // get the order of the listings to be displayed - default is desc
    const order = req.query.order || 'desc';

    // find the listings by name, offer, furnished, parking, type, sort and order - await for the response from mongoDB - if it exists or not
    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
