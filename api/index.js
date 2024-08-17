import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
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


// listen to the root path - port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000!');
});

