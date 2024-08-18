import React from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogleClick = async () => {
      try {
        // Create a new provider object and pass the provider ID to it
        const provider = new GoogleAuthProvider();
        // Get the auth object from the app object - passing the app object to the getAuth function from firebase/auth which includes all the information about the app firebase will recognize which application is using the auth
        const auth = getAuth(app);
  
        // result is the response we get from the google sign in
        const result = await signInWithPopup(auth, provider);
        // console.log(result);
  
        // fetch method to request out api route and to get the login data - POST method to send the data to the server - headers to send the data in json format - body to send the data in string format - changes to string for security purpose
        // /api/auth/google - backend will also be created
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: result.user.displayName,
            email: result.user.email,
            photo: result.user.photoURL,
          }),
        });

        // now again changing the response we got in json 
        const data = await res.json();
        // again redux thunk to dispatch the signInSuccess action to save the user information to the redux store
        dispatch(signInSuccess(data));
        // when sign in is successful, we save the user information to the redux store and navigate to the home page
        navigate('/');
      } catch (error) {
        // if there is an error, we log the error to the console
        console.log('could not sign in with google', error);
      }
    };
    return (
        <button
          onClick={handleGoogleClick}
          type='button'
          className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
        >
          Continue with google
        </button>
      );
}