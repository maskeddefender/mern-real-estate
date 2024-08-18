import { combineReducers, configureStore } from '@reduxjs/toolkit';
// userSlice me jo reducer banaya tha usko import kiya hai and rootReducer me combine kiya hai
import userReducer from './user/userSlice';
// redux-persist data ko browser k local storage me save knre k liye use hota hai - ye ek redux ki hi library hai and isme persistReducer and persistStore use hota hai jo ki redux-persist se import hota hai data ko save krne k liye
import { persistReducer, persistStore } from 'redux-persist';
// storage is used to save the data to the local storagei
import storage from 'redux-persist/lib/storage';


// rootReducer me userReducer ko combine kiya hai kynki ek hi reducer hai isliye - agar multiple reducers hote to unko combine krte
const rootReducer = combineReducers({ user: userReducer });

// persistConfig me key, storage and version pass kiya hai - key is the key for the local storage, storage is the local storage and version is the version of the local storage
const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};


// persistReducer me persistConfig and rootReducer pass kiya hai - ye persistConfig me jo key, storage and version pass kiya hai usko use krta hai and rootReducer me jo combine kiya hai usko use krta hai
// ye persistConfig and rootReducer ko combine krta hai and ek hi reducer me convert krta hai jo aage jaakr store me use hota hai
const persistedReducer = persistReducer(persistConfig, rootReducer);


// ab persistConfig and rootReducer ko combine krke store bnaya hai - isme persistedReducer pass kiya hai jo persistConfig and rootReducer ko combine krta hai
export const store = configureStore({
    // reducer: rootReducer, // ye rootReducer tha pehle - ab ye persistedReducer hai jo persistConfig and rootReducer ko combine krta hai
    reducer: persistedReducer,
    // middleware to use the serializableCheck to false - ye serializableCheck ko false krta hai taki warning na aaye
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


// this is the persistor to persist the data to the local storage
export const persistor = persistStore(store);
