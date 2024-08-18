import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs'; // to hash the password before saving it to the database so that it cannot be read by anyone


// get the information from the browser when the user is signing up, this is coming from the body of the request
export const signup = async (req, res) => {

    // to save the content from the body to the variables 
    // this gives us the flexibility to change the details of the variables in the future
    const { username, email, password } = req.body;
    // hash the password before saving it to the database - hashSync means wait for the password to be hashed before saving it to the database
    // the 10 is the number of times the password is hashed
    const hashedPassword = bcryptjs.hashSync(password, 10);
    // creating the information to the database using the model we created in the models (user) folder
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        // save the information to the database
        await newUser.save() // as the .save takes some time to save the information to the database, we use the async and await to wait for the information to be saved before we send the response
        res.status(201).json('User created successfully');
    } catch (error) {
        res.status(500).json(error.message);
    }
}