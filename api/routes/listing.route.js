import express from 'express';
// import { createListing } from '../controllers/listing.controller.js';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

//create a new router using express 
const router = express.Router();

// authenticating is alway checked first before the user can operate on the listing
// create a create route for the listing
router.post('/create', verifyToken, createListing);
// create a delete route for the listing
router.delete('/delete/:id', verifyToken, deleteListing);
// create an update route for the listing - edit the listing
router.post('/update/:id', verifyToken, updateListing);
// create a get route for the listing - information about the listing 
router.get('/get/:id', getListing);
// create a get route for the listing - list of all the listings - this is for searching listings
router.get('/get', getListings);

export default router;
