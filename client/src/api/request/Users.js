import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Users = createApi({
    reducerPath: '/apiUsers',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API}/user`,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        updateUser: builder.mutation({
            query: (data) => ({
                url: '/update',
                method: 'PUT',
                body: data
            })
        })
    })
})

export const { useUpdateUserMutation } = Users