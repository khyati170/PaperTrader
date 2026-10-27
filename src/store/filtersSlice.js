import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSectors: [],
  sortBy: "default",
  maxPrice: 1000,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    toggleSector(state, action) {
      const i = state.selectedSectors.indexOf(action.payload);
      if (i === -1) state.selectedSectors.push(action.payload);
      else state.selectedSectors.splice(i, 1);
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setMaxPrice(state, action) {
      state.maxPrice = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { toggleSector, setSortBy, setMaxPrice, resetFilters } =
  filtersSlice.actions;
export default filtersSlice.reducer;