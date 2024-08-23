import React from "react"; // Import React to use JSX and create components

import { useEffect, useState } from 'react'; // Import hooks to manage state and lifecycle
import { Link } from 'react-router-dom'; // Import Link to navigate between routes
import { Swiper, SwiperSlide } from 'swiper/react'; // Import Swiper components for image sliders
import { Navigation } from 'swiper/modules'; // Import Swiper navigation module for slider controls
import SwiperCore from 'swiper'; // Import core Swiper functionality
import 'swiper/css/bundle'; // Import Swiper CSS bundle
import ListingItem from '../components/ListingItem'; // Import ListingItem component to display individual listings

export default function Home() {
  // Declare state variables to store listings for offers, sales, and rentals
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  
  // Enable the use of Swiper's navigation controls
  SwiperCore.use([Navigation]);

  // Log the offerListings state for debugging purposes
  console.log(offerListings);

  // useEffect hook runs once when the component mounts to fetch listings data
  useEffect(() => {
    // Function to fetch offer listings (e.g., discounts or promotions)
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=6'); // Fetch offer listings from the API
        const data = await res.json(); // Parse the response JSON
        setOfferListings(data); // Update state with fetched data
        fetchRentListings(); // Trigger fetching of rental listings after offers are fetched
      } catch (error) {
        console.log(error); // Log any errors that occur during the fetch
      }
    };

    // Function to fetch rental listings
    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=6'); // Fetch rental listings from the API
        const data = await res.json(); // Parse the response JSON
        setRentListings(data); // Update state with fetched data
        fetchSaleListings(); // Trigger fetching of sale listings after rentals are fetched
      } catch (error) {
        console.log(error); // Log any errors that occur during the fetch
      }
    };

    // Function to fetch sale listings
    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=6'); // Fetch sale listings from the API
        const data = await res.json(); // Parse the response JSON
        setSaleListings(data); // Update state with fetched data
      } catch (error) {
        console.log(error); // Log any errors that occur during the fetch
      }
    };

    // Start the data fetching sequence by fetching offer listings first
    fetchOfferListings();
  }, []); // Empty dependency array ensures this runs only once on component mount

  return (
    <div>
      {/* Header section with a call-to-action to find a property */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-slate-500'>perfect</span>
          <br />
          place with ease
        </h1>
        <div className='text-gray-400 text-xs sm:text-sm'>
          Sahand Estate is the best place to find your next perfect place to
          live.
          <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link
          to={'/search'}
          className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'
        >
          Let's get started...
        </Link>
      </div>

      {/* Swiper component to showcase featured listings */}
      <Swiper navigation>
        {offerListings &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className='h-[500px]'
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* Section to display listings for offers, sales, and rentals */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        {/* Render offer listings if available */}
        {offerListings && offerListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent offers</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>Show more offers</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {/* Render rental listings if available */}
        {rentListings && rentListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>Show more places for rent</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {/* Render sale listings if available */}
        {saleListings && saleListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sale</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=sale'}>Show more places for sale</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
