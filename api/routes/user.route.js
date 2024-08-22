import express from 'express';
import { test, updateUser,  deleteUser, getUserListings, getUser} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

// The Router function is a built-in method in Express that allows you to create a new router object. A router is like a "mini-application" that can be used to define routes, middleware, and other aspects of your Express app.
const router = express.Router();

// The get() method is used to route HTTP GET requests to the specified path with the specified callback functions.


router.get('/test', test);

// update user by id 
router.post('/update/:id', verifyToken, updateUser)
router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id', verifyToken, getUserListings)
router.get('/:id', verifyToken, getUser)

export default router;