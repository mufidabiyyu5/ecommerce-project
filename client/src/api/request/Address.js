import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Address = createApi({
    reducerPath: '/apiAddress',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API}/address`,
        credentials: 'include'
    }),
    endpoints: (builder) => ({
        getProvinces: builder.query({
            query: () => ({
                url: '/get-provinces',
                method: 'GET'
            })
        }),
        getCity: builder.query({
            query: (provinceId) => ({
                url: `/get-cities/${provinceId}`,
                method: 'GET'
            })
        }),
        getDistrict: builder.query({
            query: (id) => ({
                url: `/get-district/${id}`,
                method: 'GET'
            })
        }),
        getVillage: builder.query({
            query: (id) => ({
                url: `/get-village/${id}`,
                method: 'GET'
            })
        }),
        updateAddress: builder.mutation({
            query: (body) => ({
                url: '/add',
                method: 'POST',
                body
            })
        })
    })
})

export const { 
    useGetProvincesQuery, 
    useGetCityQuery, 
    useGetDistrictQuery, 
    useGetVillageQuery, 
    useUpdateAddressMutation 
} = Address

