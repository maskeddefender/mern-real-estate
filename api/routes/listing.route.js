import express from 'express';
// import { createListing } from '../controllers/listing.controller.js';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

//create a new router using express 
const router = express.Router();

// authenticating is alway checked first before the user can operate on the listing
// create a create route for the listing
router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);
router.get('/get', getListings);

export default router;
