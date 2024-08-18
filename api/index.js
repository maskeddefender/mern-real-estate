import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
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


// Create express instance application
const app = express();

// this is going to allow us to get the information json as the input from the body of the request
app.use(express.json());

// listen to the root path - port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000!');
});



// this is in the routes folder - user.route.js
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);



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