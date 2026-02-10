import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  loading: true,
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts(state, action) {
      state.posts = action.payload;
      state.loading = false;
    },
    clearPosts(state) {
      state.posts = [];
      state.loading = false;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setPosts, clearPosts, setError } = postsSlice.actions;
export default postsSlice.reducer;
