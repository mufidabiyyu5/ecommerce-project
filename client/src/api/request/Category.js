import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export const Category = createApi({
    reducerPath: "/apiCategory",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API}/category`,
        credentials: 'include',
    }),
    tagTypes: ["categories"],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: ({search, page, limit}) => ({
                url: "/list",
                method: "GET",
                params: {search, page, limit}
            }),
            providesTags: ["categories"],
        })
    })
})

export const { useGetCategoriesQuery } = Category