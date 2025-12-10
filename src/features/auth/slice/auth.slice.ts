import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// You might want to replace this with the actual UserModel from ../types/user.types.ts
// if it matches what you are storing. For now, keeping as is to avoid breaking changes,
// but renamed to AuthState for clarity if it's strictly auth related.
export interface User {
    id: string;
    name: string;
    email: string;
    // add more fields as needed
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth", // Changed name from 'user' to 'auth' to match feature
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.error = null;
        },
        clearUser(state) {
            state.user = null;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
});

export const { setUser, clearUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
