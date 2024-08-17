import mongoose from 'mongoose';

// create the rules which is called schema
// for the user model defining the field rules and their types
const userSchema = new mongoose.Schema(
    {
      username: {
        type: String, // only string type will be accepted
        required: true, // and it is must to have it
        unique: true, // unique bhi hona chaiye, mere database se match nhi krna cahiye
   
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      avatar:{
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
      },
    },
    // time of creation of the user and time of updation of the user
    { timestamps: true }
  );
  
  // after creating schema, we need to create a model
  // first parameter is the name of the model and second is the schema of the model
  // User is the name of the model if more than 1 user then Users will be done by mongoose automatically
  const User = mongoose.model('User', userSchema);
  
  export default User;