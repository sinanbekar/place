import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
interface ColorState {
  hex: string;
}

// Define the initial state using that type
const initialState: ColorState = {
  hex: "#000000",
};

export const colorSlice = createSlice({
  name: "color",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setColorHex: (state, action: PayloadAction<string>) => {
      state.hex = action.payload;
    },
  },
});

export const { setColorHex } = colorSlice.actions;

export default colorSlice.reducer;
