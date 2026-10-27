import { configureStore } from "@reduxjs/toolkit";
import user from "./userSlice";
import filters from "./filtersSlice";

export const store = configureStore({ reducer: { user, filters } });
