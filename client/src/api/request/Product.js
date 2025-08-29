import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const Product = createApi({
    reducerPath: "/apiProduct",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API}/product`,
        credentials: 'include',
    }),
    tagTypes: ["products"],
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: ({ search, page, limit, categoryId }) => ({
                url: "/list",
                method: "GET",
                params: {search, page, limit, categoryId}
            }),
            providesTags: ["products"],
        })
    })
})

export const { useGetProductsQuery } = Product