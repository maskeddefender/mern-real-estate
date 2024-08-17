import express from 'express';


// Create express instance application
const app = express();


// listen to the root path - port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000!');
});