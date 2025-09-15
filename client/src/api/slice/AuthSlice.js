import { createSlice } from "@reduxjs/toolkit";
import { Auth } from "../request/Auth";

const AuthSlice = createSlice({
    name: 'auth',
    initialState: {
        user: {},
        isSignIn: false,
        isLoading: false,
    },
    reducers: {
        setLogin: (state, action) => {
            state.user = action.payload;
            state.isSignIn = true;
            state.isLoading = false;
        },
        setLogout: (state) => {
            state.user = {};
            state.isSignIn = false;
        },
        setLoading: (state, action) => {
            state.isLoading = true;
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            Auth.endpoints.login.matchPending,
            (state) => {
                state.isLoading = true;
            }
        ).addMatcher(
            Auth.endpoints.login.matchFulfilled,
            (state, {payload}) => {
                state.user = payload,
                state.isSignIn = true,
                state.isLoading = false
            }
        ).addMatcher(
            Auth.endpoints.login.matchRejected,
            (state) => {
                state.user = {},
                state.isSignIn = false,
                state.isLoading = false
            }
        ).addMatcher(
            Auth.endpoints.loadUser.matchFulfilled,
            (state, { payload }) => {
                state.user = payload.result,
                state.isSignIn = true
            }
        )
    }
})

export const { setLogin, setLogout, setLoading } = AuthSlice.actions
export default AuthSlice.reducer