import { createSlice } from '@reduxjs/toolkit';

// createSlice is a function that takes an object of reducer functions, a slice name, and an initial state value, and automatically generates action creators and action types that correspond to the reducers and state.

// creating an initial state like loading false error false and user null
const initialState = {
    currentUser: null,
    error: null,
    loading: false,
  };

  
// using this creating user Slice
const userSlice = createSlice({
    // set the name of the slice
    name: 'user',
    // pass the initial state to the slice
    initialState,
    // reducers are functions that take the current state and an action and return a new state
    reducers: {
        // signInStart is a function that takes the state and sets the loading to true
      signInStart: (state) => {
        state.loading = true;
      },
      // signInSuccess is a function that takes the state and action and sets the currentUser to the action payload and loading to false and error to null
      signInSuccess: (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
      },
      // signInFailure is a function that takes the state and action and sets the error to the action payload and loading to false
      signInFailure: (state, action) => {
        state.error = action.payload;
        state.loading = false;
      },
      // updateUserStart is a function that takes the state and sets the loading to true
      updateUserStart: (state) => {
        state.loading = true;
      },
      // updateUserSuccess is a function that takes the state and action and sets the currentUser to the action payload and loading to false and error to null
      updateUserSuccess: (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
      },
      // updateUserFailure is a function that takes the state and action and sets the error to the action payload and loading to false
      updateUserFailure: (state, action) => {
        state.error = action.payload;
        state.loading = false;
      },
      // deleteUserStart is a function that takes the state and sets the loading to true
      deleteUserStart: (state) => {
        state.loading = true;
      },
      // deleteUserSuccess is a function that takes the state and sets the currentUser to null and loading to false and error to null
      deleteUserSuccess: (state) => {
        state.currentUser = null;
        state.loading = false;
        state.error = null;
      },
      // deleteUserFailure is a function that takes the state and action and sets the error to the action payload and loading to false
      deleteUserFailure: (state, action) => {
        state.error = action.payload;
        state.loading = false;
      },
      // signOutUserStart is a function that takes the state and sets the loading to true
      signOutUserStart: (state) => {
        state.loading = true;
      },
      // signOutUserSuccess is a function that takes the state and sets the currentUser to null and loading to false and error to null
      signOutUserSuccess: (state) => {
        state.currentUser = null;
        state.loading = false;
        state.error = null;
      },
      // signOutUserFailure is a function that takes the state and action and sets the error to the action payload and loading to false
      signOutUserFailure: (state, action) => {
        state.error = action.payload;
        state.loading = false;
      },
    },
  });
  
  export const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateUserFailure,
    updateUserSuccess,
    updateUserStart,
    deleteUserFailure,
    deleteUserSuccess,
    deleteUserStart,
    signOutUserFailure,
    signOutUserSuccess,
    signOutUserStart,
  } = userSlice.actions; // exporting the actions
  
  export default userSlice.reducer;
