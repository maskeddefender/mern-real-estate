import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  // Initialize the navigate function to programmatically navigate to different routes
  const navigate = useNavigate();

  // Initialize the state for sidebar data with default values
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '', // Stores the search term entered by the user
    type: 'all', // Stores the selected type of listing (all, rent, sale)
    parking: false, // Boolean to indicate if parking is required
    furnished: false, // Boolean to indicate if furnishing is required
    offer: false, // Boolean to indicate if the listing should have offers
    sort: 'created_at', // Stores the sorting criteria (created_at, price, etc.)
    order: 'desc', // Stores the order of sorting (ascending or descending)
  });

  // console.log(sidebardata);

  // State to manage the loading status
  const [loading, setLoading] = useState(false);
  // State to store the fetched listings data
  const [listings, setListings] = useState([]);
  // State to determine if the "Show More" button should be displayed
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Extract the query parameters from the URL to the search for listings and update it in the sidebar data state realtime 
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    // Update the sidebar data state if query parameters are present in the URL
    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '', // Set the search term from the URL or default to an empty string
        type: typeFromUrl || 'all', // Set the type from the URL or default to 'all'
        parking: parkingFromUrl === 'true' ? true : false, // Convert the string 'true'/'false' to a boolean
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at', // Set the sort parameter from the URL or default to 'created_at'
        order: orderFromUrl || 'desc', // Set the order from the URL or default to 'desc'
      });
    }

    // Fetch listings based on the current query parameters
    const fetchListings = async () => {
      setLoading(true); // Start the loading state
      setShowMore(false); // Hide the "Show More" button during loading
      const searchQuery = urlParams.toString(); // Convert the query parameters to a query string for the user to see
      const res = await fetch(`/api/listing/get?${searchQuery}`); // Fetch listings from the server
      const data = await res.json(); // Parse the JSON response
      if (data.length > 8) {
        setShowMore(true); // Show the "Show More" button if there are more than 8 listings
      } else {
        setShowMore(false); // Hide the "Show More" button if 8 or fewer listings are returned
      }
      setListings(data); // Update the listings state with the fetched data
      setLoading(false); // End the loading state
    };

    fetchListings(); // Invoke the function to fetch listings
  }, [location.search]); // Dependency array includes location.search to re-run the effect when it changes

  // Handle changes to the form inputs
  const handleChange = (e) => {
    if (e.target.id === 'all' || e.target.id === 'rent' || e.target.id === 'sale') {
      setSidebardata({ ...sidebardata, type: e.target.id }); // Update the type of listing
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value }); // Update the search term
    }

    if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setSidebardata({
        ...sidebardata,
        [e.target.id]: e.target.checked || e.target.checked === 'true' ? true : false, // Update boolean values for amenities and offers
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at'; // Extract the sort criteria from the value
      const order = e.target.value.split('_')[1] || 'desc'; // Extract the sort order from the value
      setSidebardata({ ...sidebardata, sort, order }); // Update the sort and order values
    }
  };

  // Handle form submission to perform the search
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    const urlParams = new URLSearchParams(); // Initialize URLSearchParams
    urlParams.set('searchTerm', sidebardata.searchTerm); // Set the search term parameter
    urlParams.set('type', sidebardata.type); // Set the type parameter
    urlParams.set('parking', sidebardata.parking); // Set the parking parameter
    urlParams.set('furnished', sidebardata.furnished); // Set the furnished parameter
    urlParams.set('offer', sidebardata.offer); // Set the offer parameter
    urlParams.set('sort', sidebardata.sort); // Set the sort parameter
    urlParams.set('order', sidebardata.order); // Set the order parameter
    const searchQuery = urlParams.toString(); // Convert the parameters to a query string
    navigate(`/search?${searchQuery}`); // Navigate to the search results page with the query string
  };

  // Handle "Show More" button click to fetch additional listings
  const onShowMoreClick = async () => {
    const numberOfListings = listings.length; // Get the current number of listings
    const startIndex = numberOfListings; // Set the start index for the next batch of listings
    const urlParams = new URLSearchParams(location.search); // Get the current query parameters
    urlParams.set('startIndex', startIndex); // Set the startIndex parameter for pagination
    const searchQuery = urlParams.toString(); // Convert the parameters to a query string
    const res = await fetch(`/api/listing/get?${searchQuery}`); // Fetch the next batch of listings
    const data = await res.json(); // Parse the JSON response
    if (data.length < 9) {
      setShowMore(false); // Hide the "Show More" button if fewer than 9 listings are returned
    }
    setListings([...listings, ...data]); // Append the new listings to the existing ones
  };

  // our search seen
  return (
    <div className='flex flex-col md:flex-row'>
      <div className='p-7  border-b-2 md:border-r-2 md:min-h-screen'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <div className='flex items-center gap-2'>
            <label className='whitespace-nowrap font-semibold'>
              Search Term:
            </label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search...'
              className='border rounded-lg p-3 w-full'
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Type:</label>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='all'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.type === 'all'}
              />
              <span>Rent & Sale</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='rent'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='sale'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.type === 'sale'}
              />
              <span>Sale</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className='flex gap-2 flex-wrap items-center'>
            <label className='font-semibold'>Amenities:</label>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='parking'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.parking}
              />
              <span>Parking</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='furnished'
                className='w-5'
                onChange={handleChange}
                checked={sidebardata.furnished}
              />
              <span>Furnished</span>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={'created_at_desc'}
              id='sort_order'
              className='border rounded-lg p-3'
            >
              <option value='regularPrice_desc'>Price high to low</option>
              <option value='regularPrice_asc'>Price low to hight</option>
              <option value='createdAt_desc'>Latest</option>
              <option value='createdAt_asc'>Oldest</option>
            </select>
          </div>
          <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
            Search
          </button>
        </form>
      </div>
      <div className='flex-1'>
        <h1 className='text-3xl font-semibold border-b p-3 text-slate-700 mt-5'>
          Listing results:
        </h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {!loading && listings.length === 0 && (
            <p className='text-xl text-slate-700'>No listing found!</p>
          )}
          {loading && (
            <p className='text-xl text-slate-700 text-center w-full'>
              Loading...
            </p>
          )}

          
          {!loading &&
            listings &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='text-green-700 hover:underline p-7 text-center w-full'
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
