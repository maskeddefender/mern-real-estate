import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import path from 'path'; // using this path we will build the directory name
dotenv.config();

// to get application configuration from .env file 

mongoose
    // application string to connect to MongoDB from mongoDB website 
    .connect(process.env.MONGO)
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log(err);
    });

    // dynamic directory app name so that this app run in this computer as well as other computer
    // using this we will build a static folder 
    const __dirname = path.resolve();


// Create express instance application
const app = express();

// this is going to allow us to get the information json as the input from the body of the request
app.use(express.json());

// this is going to allow us to get the information from the cookie - initializing the cookie parser
app.use(cookieParser());

// listen to the root path - port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000!');
});



// this is in the routes folder - user.route.js
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// Serve static files from the 'client/dist' directory, which is where the built client-side React application resides.
// This ensures that any static assets (e.g., CSS, JavaScript, images) needed by the client are properly served by the server.
app.use(express.static(path.join(__dirname, '/client/dist')));

// Handle all remaining routes with a wildcard '*' to ensure that the client-side React application is served
// for any route that doesn't match an API endpoint. This is crucial for single-page applications (SPAs) that use client-side routing.
// When a request is made to any route (e.g., '/about', '/contact'), this middleware will serve the 'index.html' file.
// React Router will then take over and render the appropriate component on the client side.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


// api middleware to handle errors
// error - is the error coming form the input of the middleware
// req - is the request data from the browser
// res - response from the server to the client side
// next - is the next middleware to be executed
app.use((err, req, res, next) => {
    // statusCode - is the status code of the error else it will be 500 
    const statusCode = err.statusCode || 500;
    // message - is the message of the error else it will be 'Internal Server Error'
    const message = err.message || 'Internal Server Error';
    // return the status code and the message of the error
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
});