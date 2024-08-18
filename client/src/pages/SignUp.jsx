import React from "react"
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  // formData object will be changed using the setFormData function which is initially an empty object
  const [formData, setFormData] = useState({});
  // error state to display the error message if there is an error
  const [error, setError] = useState(null);
  // loading state to display the loading message if the data is loading
  const [loading, setLoading] = useState(false);
  // navigate function to navigate to the sign in page
  const navigate = useNavigate();

  // function to handle the change of the input - take an event 
  const handleChange = (e) => {
    // set the form data to the current form data and update the id of the target to the value of the target
    setFormData({
      // spread operator to get the current form data
      ...formData,
      // add the new change to the form data
      [e.target.id]: e.target.value,
    });
  };
  // console.log(formData);


  // function to handle the submit of the form - take an event
  const handleSubmit = async (e) => {
    // prevent the default action of the form - i.e prevent refreshing the page when the form is submitted
    e.preventDefault();
    try {
      setLoading(true);
      // fetch method to request out api route and to get the login data
      // each time you see the /api add the localhost 3000 from the proxy sever defined in vite.config.in
      const res = await fetch('/api/auth/signup', {
        // POST method to send the data to the server
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // changes to string for security purpose
        // send from the body of the browser and send these data in string format
        body: JSON.stringify(formData),
      });
      // now again changing the response we got in json 
      const data = await res.json();
      console.log(data);

      // if the data is not successful then set the loading to false and set the error to the message
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      // if data is successful then set the loading to false and set the error to null and navigate to the sign in page
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } 
    // everything under try and catch to run smoothly and catch the error if there is any
    // if submitted without any data then it will show the error message
    catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  return(
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {/* 3 inputs for username, email, and password */}
        <input // username
          type='text'
          placeholder='username'
          className='border p-3 rounded-lg'
          // adding id to let us know if it get changed later on 
          id='username'
          // onchange event listener - when the input changes we want to call the handleChange function
          onChange={handleChange}
        />
        <input // email
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          id='email'
          onChange={handleChange}
        />
        <input // password
          type='password'
          placeholder='password'
          className='border p-3 rounded-lg'
          id='password'
          onChange={handleChange}
        />

        <button // submit button - loading is true then show loading else show sign up
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-90 disabled:opacity-70'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth/>
      </form>
      <div className='flex gap-2 mt-5'>
        {/* if already signed up then go to sign in page */}
        <p>Have an account?</p>
        <Link to={'/sign-in'}>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
      
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  );
}

 