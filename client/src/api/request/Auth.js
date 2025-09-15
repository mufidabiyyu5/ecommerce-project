import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Auth = createApi({
    reducerPath: '/apiAuth',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API}/user`,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: '/sign-in',
                method: 'POST',
                body: data
            })
        }),
        register: builder.mutation({
            query: (data) => ({
                url: '/register',
                method: 'POST',
                body: data
            })
        }),
        loadUser: builder.mutation({
            query: () => ({
                url: '/load-user',
                method: 'GET',
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST'
            })
        })
    })
})

export const { useLoginMutation, useRegisterMutation, useLoadUserMutation, useLogoutMutation } = Auth