import { configureStore } from '@reduxjs/toolkit'
import { Product } from './request/Product.js';
import { Category } from './request/Category.js';
import { Auth } from './request/Auth.js';
import AuthSlice from './slice/AuthSlice.js';
import { Users } from './request/Users.js';
import { Address } from './request/Address.js';

const store = configureStore({
    reducer: {
        auth: AuthSlice,
        [Auth.reducerPath]: Auth.reducer,
        [Users.reducerPath]: Users.reducer,
        [Product.reducerPath]: Product.reducer,
        [Category.reducerPath]: Category.reducer,
        [Address.reducerPath]: Address.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([
        Auth.middleware,
        Users.middleware,
        Product.middleware,
        Category.middleware,
        Address.middleware
    ])
})

export default store;