import { configureStore } from '@reduxjs/toolkit'
import { Product } from './request/Product.js';
import { Category } from './request/Category.js';

const store = configureStore({
    reducer: {
        [Product.reducerPath]: Product.reducer,
        [Category.reducerPath]: Category.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([
        Product.middleware,
        Category.middleware
    ])
})

export default store;