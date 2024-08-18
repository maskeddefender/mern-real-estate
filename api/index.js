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
