// this is used to protect the profile page when attempted to see by an un authenticate user
// you have to sign in to see the profile page

import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

// PrivateRoute component
export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  // if currentUser exists show the outlet else navigate to sign in page
  return currentUser ? <Outlet /> : <Navigate to='/sign-in' />;
}
