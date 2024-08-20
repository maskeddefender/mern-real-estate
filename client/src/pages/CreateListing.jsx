import { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
    // setting the initial state of the form data and the files to be uploaded to the server
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  // setting the initial state of the form data and the files to be uploaded to the server
  const [files, setFiles] = useState([]);
  // console.log(files);
  // since there are more than 1 input fields, we will use an object to store the form data instead of using multiple states
  // setting the initial state of the form data to an object with the following properties
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  // setting the initial state of the uploading, error and loading states to false 
  const [uploading, setUploading] = useState(false);
  // set the error state to false
  const [error, setError] = useState(false);
  // set the loading state to false
  const [loading, setLoading] = useState(false);
  console.log(formData);

  // function to handle the image submit and store the images in the firebase storage
  const handleImageSubmit = (e) => {
    // only 6 images can be uploaded per listing
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      // set the uploading state to true and the image upload error to false
      setUploading(true);
      setImageUploadError(false);
      // create an array of promises to store the images in the firebase storage
      // we are promising that we will upload multiple images to the firebase storage (less tha 7 images)
      const promises = [];

      // loop one by one through the files and store the images in the firebase storage using the storeImage function
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i])); //
      }
      // once all the promises are resolved, set the image urls in the form data state to the urls of the images that were uploaded
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData, // keeping the previous data
            imageUrls: formData.imageUrls.concat(urls), // adding the new one url to previous ones
          });
          // initializing the files to an empty array
          setImageUploadError(false);
          setUploading(false);
        })
        // if the image upload fails, set the image upload error to 'Image upload failed'
        .catch((err) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
      // if the number of images is more than 6, set the image upload error to 'You can only upload 6 images per listing'
    
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  // function to store the image in the firebase storage
  const storeImage = async (file) => {
    // return that resolves the promise if the image is uploaded successfully and rejects the promise if the image upload fails
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      // create a unique file name for the image
      const fileName = new Date().getTime() + file.name;
      // create a reference to the firebase storage
      const storageRef = ref(storage, fileName);
      // upload the image to the firebase storage - resumable upload
      const uploadTask = uploadBytesResumable(storageRef, file);
      // listen to the state of the upload task
      uploadTask.on(
        'state_changed', // listen to the state of the upload task
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        // if the upload fails, reject the promise
        (error) => {
          reject(error);
        },
        // if the upload is successful, resolve the promise
        () => {
            // get the download url of the image that was uploaded to the firebase storage then resolve the promise
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  // function to remove the image from the form data state
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      // The .filter() method creates a new array by including only the items that meet a certain condition.
      // These are the parameters passed to the callback function inside .filter(). The first parameter (_) represents the current item in the array, and the second parameter (i) represents the index of that item. The underscore (_) is used as a placeholder when the first parameter is not needed.
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  // this is for the form data to be updated when the user types in the input fields
  const handleChange = (e) => {
    // if the target id is sale or rent, set the type in the form data to the target id
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData, // keeping the previous data
        type: e.target.id, // setting the type to the target id, that is, sale or rent - can't be both
      });
    }

    // if the target id is parking, furnished or offer, set the form data to the target id and checked to the target checked - boolean value
    if (
      e.target.id === 'parking' || 
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked, // this bracket just gives us the name of the e.target.id
      });
    }

    if (
      e.target.type === 'number' || // number for beds, baths, regular price and discount price
      e.target.type === 'text' || // text for name and address
      e.target.type === 'textarea' // textarea for description
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  // this is to submit our data to mongoDB database when clicked on the create listing button
  const handleSubmit = async (e) => {
    // to prevent refreshing of page
    e.preventDefault();
    try {
        // if there are no images uploaded, set the error to 'You must upload at least one image'
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
        // if the discount price is greater than the regular price, set the error to 'Discount price must be lower than regular price'
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true); // set the loading state to true
      setError(false); // set the error state to false
      // fetch the data from the api endpoint and send the form data to the server to create the listing
      const res = await fetch('/api/listing/create', { 
        method: 'POST', // post method to send the data to the server
        headers: {
          'Content-Type': 'application/json', // content type is json
        },
        // send the form data to the server as a json string and include the user reference in the form data
        body: JSON.stringify({
          ...formData, // send the form data
          userRef: currentUser._id, // and the user reference of current user
        }),
      });
      // get the data from the response in json format
      const data = await res.json();
        // set the loading state to false
      setLoading(false);
        // if the success is false, set the error to the message
      if (data.success === false) {
        setError(data.message);
      }
        // if the success is true, navigate to the listing page with the id of the listing that was created in the database
      navigate(`/listing/${data._id}`);
      // if there is an error, set the error to the error message
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    // seo friendly form
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create Your Listing
      </h1>
      {/* in large screens, the form will be displayed in two columns but in small screens, it will be displayed in one column due to the flex-wrap property */}
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        {/* creating div for inputs top of each other and another div for images side by side */}
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Name'
            className='border p-3 rounded-lg'
            id='name'
            maxLength='62' // max length of a title tag
            minLength='10' // min length of a title tag
            required // compulsory field for the form
            onChange={handleChange}
            value={formData.name}
          />
          <textarea // text area for description
            type='text'
            placeholder='Description'
            className='border p-3 rounded-lg'
            id='description'
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type='text'
            placeholder='Address'
            className='border p-3 rounded-lg'
            id='address'
            required
            onChange={handleChange}
            value={formData.address}
          />
          {/* this is a div for checkboxes for sale, rent, parking, furnished and offer listing items */}
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='sale'
                className='w-5'
                onChange={handleChange}
                checked={formData.type === 'sale'} // if the type is sale, the checkbox will be checked
              />
              <span>Sell</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='rent'
                className='w-5'
                onChange={handleChange}
                checked={formData.type === 'rent'} // if the type is rent, the checkbox will be checked
              />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='parking'
                className='w-5'
                onChange={handleChange}
                checked={formData.parking} // if the parking is available, the checkbox will be checked
              />
              <span>Parking spot</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='furnished'
                className='w-5'
                onChange={handleChange}
                checked={formData.furnished} // if the listing is furnished, the checkbox will be checked
              />
              <span>Furnished</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-5'
                onChange={handleChange}
                checked={formData.offer} // if the listing is on offer, the checkbox will be checked
              />
              <span>Offer</span>
            </div>
          </div>
            {/* this is a div for beds, baths, regular price and discounted price */}
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bedrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                onChange={handleChange}
                value={formData.bedrooms} // the value of the input field is the number of bedrooms
              />
              <p>Beds</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bathrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg'
                onChange={handleChange}
                value={formData.bathrooms} // the value of the input field is the number of bathrooms
              />
              <p>Baths</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='regularPrice'
                min='50'
                max='10000000'
                required
                className='p-3 border border-gray-300 rounded-lg'
                onChange={handleChange}
                value={formData.regularPrice} // the value of the input field is the regular price
              />
              <div className='flex flex-col items-center'>
                <p>Regular price</p>
                {formData.type === 'rent'  && (                   // if the type is rent or sale, display the text in the span
                  <span className='text-xs'>($ / month)</span>
                )}
              </div>
            </div>
            {formData.offer && ( // if there is offer, only then display the discounted price
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  id='discountPrice'
                  min='0'
                  max='10000000'
                  required
                  className='p-3 border border-gray-300 rounded-lg'
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className='flex flex-col items-center'>
                  <p>Discounted price</p>

                  {formData.type === 'rent' && (
                    <span className='text-xs'>($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* this is a div for images */}
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'> 
              The first image will be the cover (max 6)
            </span>
          </p>
          {/* this is a div for images to be uploaded and a button to upload the images */}
          <div className='flex gap-4'>
            <input
              onChange={(e) => setFiles(e.target.files)} // set the files to be uploaded to the files state when the user selects the files
              className='p-3 border border-gray-300 rounded w-full'
              type='file' // input type is file
              id='images' 
              accept='image/*' // accept only images
              multiple // allow multiple images to be uploaded upto 6
            />
            <button
              type='button'
              disabled={uploading} // disable the button when the images are being uploaded
              onClick={handleImageSubmit} // handle the image submit and store the images in the firebase storage
              className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
            > 
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
            {/* if there is an image upload error, display the error */}
          <p className='text-red-700 text-sm'>
            {imageUploadError && imageUploadError}
          </p>
            {/* if there are images in the form data, display the images */}
          {formData.imageUrls.length > 0 && 
            formData.imageUrls.map((url, index) => (
              <div
                key={url} // this key will verify the image
                className='flex justify-between p-3 border items-center'
              >
                <img
                  src={url} // image url from the firebase storage
                  alt='listing image'
                  className='w-20 h-20 object-contain rounded-lg'
                />
                <button // button to remove the image
                  type='button'
                  onClick={() => handleRemoveImage(index)} // handle the remove image function
                  className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            
            disabled={loading || uploading}
            className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  );
}
