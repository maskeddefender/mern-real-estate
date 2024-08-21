import React from "react";

// useSelector is a hook from react-redux that allows you to extract data from the Redux store state
import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';


export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // file is the piece of state responsible for holding the file to be uploaded
  const [file, setFile] = useState(undefined);
  //console.log(file);
  // filePerc is the piece of state responsible for holding the progress of the file upload in percentage
  const [filePerc, setFilePerc] = useState(0);
  // fileUploadError is the piece of state responsible for holding the error message if there is an error in the file upload
  const [fileUploadError, setFileUploadError] = useState(false);
  // formData is the piece of state responsible for holding the form data - this is the data that will be sent to the server when the form is submitted - when there will be any changes in the form inputs the formData state will be updated
  const [formData, setFormData] = useState({});
  // console.log(formData);
  // updateSuccess is the piece of state responsible for showing the success message when the user is updated successfully
  const [updateSuccess, setUpdateSuccess] = useState(false);
  // for timer to show the message for a few seconds
  // const [showMessage, setShowMessage] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  // initializing the useDispatch hook to dispatch the actions
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  // useEffect hook to handle the file upload - when the file state changes the file upload is triggered
  // here we are using the firebase storage to upload the file - when the file is uploaded we get the download url and set it to the formData state using the setFormData function
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);


  // timer to show the message for a few seconds - but it is not used in the code
  // useEffect(() => {
  //   if (updateSuccess) {
  //     setShowMessage(true);

  //     // Hide the message after 5 seconds
  //     const timer = setTimeout(() => {
  //       setShowMessage(false);
  //     }, 5000);

  //     // Cleanup the timer when the component unmounts or updateSuccess changes
  //     return () => clearTimeout(timer);
  //   }
  // }, [updateSuccess]);

  // function to handle the file upload - this function is responsible for uploading the file to the firebase storage
  const handleFileUpload = (file) => {
    // get the firebase storage - based on this firebase will recognize the storage bucket
    const storage = getStorage(app); // this app is the firebase app we created in the firebase.js file
    // setting the file name to the current time in milliseconds and the file name
    const fileName = new Date().getTime() + file.name;
    // crating a reference to the storage bucket with the file name - this is the path where the file will be stored in the firebase storage
    const storageRef = ref(storage, fileName);
    // uploading the file to the storage reference - this is a resumable upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    // this is the event listener for the state change of the upload task - this will give us the progress of the upload
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100; // calculating the progress of the upload in percentage
        setFilePerc(Math.round(progress)); // setting the progress to the filePerc state
        // console.log('Upload is ' + progress + '% done');
      },
      // if there is an error in the upload task this function will be triggered
      (error) => {
        setFileUploadError(true);
      },
      // get the file
      () => {
        // get the download url of the file - this is the url where the file is stored in the firebase storage
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          // formData is the state that holds the form data - here we are setting the avatar key of the formData state to the download url of the file - if any updates are made to the avatar this will be updated in the formData state
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  // function to handle the change in the form inputs - this function is responsible for updating the formData state when there is a change in the form inputs - this function is triggered when there is a change in the form inputs when clicked or typed
  const handleChange = (e) => {
    // fromData is the previous state of the formData state - we are using the spread operator to get the previous state of the formData state
    // e.target.id is the id of the input field - this is used to set the key of the formData state to the value of the input field
    // e.target.value is the value of the input field - this is used to set the value of the key of the formData state
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // function to handle the form submission - this function is responsible for updating the user information - when the form is submitted the form data is sent to the server to update the user information
  const handleSubmit = async (e) => {
    // prevent the default behavior of the form - this is to prevent the page from reloading when the form is submitted
    e.preventDefault();

    try {
      // dispatch the updateUserStart action - this is to set the loading state to true
      dispatch(updateUserStart()); // loading effect will be shown
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      // get the data from the response in json format
      const data = await res.json();
      if (data.success === false) {
        // if the success key in the data object is false then dispatch the updateUserFailure action - this is to set the error state to the error message in the data object
        dispatch(updateUserFailure(data.message));
        return;
      }
      // if everything is okay then dispatch the data
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  //
  const handleDeleteUser = async () => {
    try {
      // if the delete user request is made then dispatch the deleteUserStart action - this is to set the loading state to true
      dispatch(deleteUserStart());
      // create a delete request to the server to delete the user by id
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        // method is delete
        method: 'DELETE',
      });
      // get the data from the response in json format
      const data = await res.json();
      // if the success key in the data object is false then dispatch the deleteUserFailure action - this is to set the error state to the error message in the data object
      if (data.success === false) {
        // if there is an error in the delete user request then dispatch the deleteUserFailure action - this is to set the error state to the error message
        dispatch(deleteUserFailure(data.message));
        return;
      }
      // if everything is okay then dispatch the deleteUserSuccess action - this is to set the currentUser state to null and set the loading state to false and error state to null
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      // if there is an error in the delete user request then dispatch the deleteUserFailure action - this is to set the error state to the error message
      dispatch(deleteUserFailure(error.message));
    }
  };

  // function to handle the sign out of the user - this function is responsible for signing out the user - when the sign out button is clicked the user is signed out
  const handleSignOut = async () => {
    try {
      // if the sign out request is made then dispatch the signOutUserStart action - this is to set the loading state to true
      dispatch(signOutUserStart());
      // create a get request to the server to sign out the user
      const res = await fetch('/api/auth/signout');
      // get the data from the response in json format
      const data = await res.json();
      // if the success key in the data object is false then dispatch the deleteUserFailure action - this is to set the error state to the error message in the data object
      if (data.success === false) {

        dispatch(deleteUserFailure(data.message));
        return;
      }
      // if everything is okay then dispatch the deleteUserSuccess action - this is to set the currentUser state to null and set the loading state to false and error state to null
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };

  // function to handle the show listings of the user - this function is responsible for showing the listings of the user - when the show listings button is clicked the listings of the user are shown
  const handleShowListings = async () => {
    try {
      // if there is no error in showing the listings then set the showListingsError state to false
      setShowListingsError(false);
      // create a get request to the server to get the listings of the user by id - the user id is passed as a parameter in the url
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      // get the data from the response in json format
      const data = await res.json();
      // if the success key in the data object is false then set the showListingsError state to true
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      // if everything is okay then set the user listings to the data object - this is to show the listings of the user in the UI
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  // function to handle the delete of the listing - this function is responsible for deleting the listing - when the delete button is clicked the listing is deleted
  const handleListingDelete = async (listingId) => {
    try {
      // create a delete request to the server to delete the listing by id
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE', // method is delete
      });
      // get the data from the response in json format
      const data = await res.json();
      // if the success key in the data object is false then log the message in the console and return
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      // if everything is okay then set the user listings to the previous state of the user listings state - this is to remove the deleted listing from the UI
      setUserListings((prev) =>
        // filter the listings and return the listings that do not have the listing id - this is to remove the deleted listing from the UI
        prev.filter((listing) => listing._id !== listingId)
      );
      // if the listing is deleted successfully then show the message in the console
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>User Profile</h1>
      {/* this handleSubmit function is responsible for updating the user information - when the form is submitted the form data is sent to the server to update the user information */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])} // set the file to the file state when the file input changes - if any changes are made to the file input it is set to the file state
          type='file' // this is hidden and is clicked when the image is clicked using the react useRef hook
          ref={fileRef} // reference to the file input to be clicked when the image is clicked
          hidden // hide the file input
          accept='image/*' // accept only image files
        />
        <img
          onClick={() => fileRef.current.click()}
          // if formData.avatar exists use it else use currentUser.avatar - this is to show the image preview and is rendered using redux state and local state
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? ( // error message if there is an error in the file upload
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : (filePerc > 0 && filePerc < 100 ) ?  ( // if the file upload is in progress show the percentage of the upload
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? ( // if the file upload is completed show the success message
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : ( // if there is no file upload show nothing
            ''
          )}
        </p>
        {/* inputs for username, email and password */}
        <input
          type='text'
          placeholder='username'
          // defaultValue is used to set the default value of the input to the current user username 
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          // type is email to show the email keyboard when the input is clicked
          type='email'
          placeholder='email'
          id='email'
          defaultValue={currentUser.email}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          // type is password to hide the password when typed
          type='password'
          placeholder='password'
          onChange={handleChange}
          id='password'
          className='border p-3 rounded-lg'
        />
        <button // button to submit the form and loading effect is shown when the form is submitted
          disabled={loading}          
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to={'/create-listing'} // when clicked the user is redirected to the create listing page - this is done using the Link component from react-router-dom
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser} 
          className='text-red-800 cursor-pointer'
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className='text-red-800 cursor-pointer'>
          Sign out
        </span>
      </div>

      {/* if there is an error in the file upload show the error message */}
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
      {/* button to show the listings of the user - when clicked the user listings are shown */}
      <button onClick={handleShowListings} className='text-green-700 mt-5 w-full'>
        Show Listings
      </button>
      {/* if there is an error in showing the listings show the error message */}
      <p className='text-red-700 mt-5'>
        {showListingsError ? 'Error showing listings' : ''}
      </p>

      {/* if the user has listings in existing then show the listings below  */}
      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            Your Listings
           </h1> {/* this will give us each listings */}
          {userListings.map((listing) => (
            <div
              key={listing._id} // key is the id of the listing - this is used to uniquely identify the listing
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={`/listing/${listing._id}`}> {/* when the listing is clicked the user is redirected to the listing page */}
                <img //title k badle first image as a cover show kr rhe
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                to={`/listing/${listing._id}`} 
              >
                <p>{listing.name}</p> {/* name of the listing as title */}
              </Link>

              {/* Two buttons for delete and edit listing - when the delete button is clicked the listing is deleted and when the edit button is clicked the user is redirected to the update listing page */}
              <div className='flex flex-col item-center'>
                <button
                  onClick={() => handleListingDelete(listing._id)} // 
                  className='text-red-700 uppercase'
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-800 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
