import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/api";

const SESSION_KEY = "paperTrader:session";

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function readSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    return s?.email ? s : null;
  } catch {
    return null;
  }
}

// ---------- Thunks (server se baat) ----------

// Login ya refresh par: server se user ka data lao, na mile toh naya banao
export const loadUserData = createAsyncThunk("user/load", async (userData) => {
  let saved = null;
  try {
    saved = await api.get(`/userData/${encodeURIComponent(userData.email)}`);
  } catch (err) {
    if (err.status !== 404) throw err; // 404 = naya user, baaki errors = server problem
  }

  let data;
  if (saved) {
    data = {
      balance: saved.balance,
      holdings: saved.holdings,
      transactions: saved.transactions,
      watchlist: saved.watchlist,
    };
  } else {
    // pehli baar: wahi seeding jo pehle handleLogin mein thi
    const formattedHoldings = {};
    (userData.holdings || []).forEach((stock) => {
      formattedHoldings[stock.symbol] = {
        quantity: stock.quantity,
        avgBuyPrice: stock.buyPrice,
        buyDate: stock.buyDate,
        name: stock.name,
      };
    });
    const seededTransactions = (userData.holdings || []).map((stock) => ({
      id: makeId(),
      type: "BUY",
      symbol: stock.symbol,
      quantity: stock.quantity,
      price: stock.buyPrice,
      total: stock.buyPrice * stock.quantity,
      date: stock.buyDate,
    }));
    data = {
      balance: userData.balance ?? 50000,
      holdings: formattedHoldings,
      transactions: seededTransactions,
      watchlist: [],
    };
    
  }

  const sessionUser = {
    name: userData.name,
    email: userData.email,
    isDemo: !!userData.isDemo,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  localStorage.setItem("accountType", userData.isDemo ? "demo" : "normal");

  return { user: sessionUser, data };
});

// State badalne par poora data json-server mein save
// export const saveUserData = createAsyncThunk("user/save", async (_, { getState }) => {
//   const { user, balance, holdings, transactions, watchlist } = getState().user;
//   const body = { id: user.email, balance, holdings, transactions, watchlist };
//   try {
//     await api.put(`/userData/${encodeURIComponent(user.email)}`, body);
//   } catch (err) {
//     if (err.status === 404) await api.post("/userData", body); // pehli baar create
//     else throw err;
//   }
// });
export const saveUserData = createAsyncThunk(
  "user/save",
  async (_, { getState }) => {
    const { user, balance, holdings, transactions, watchlist } =
      getState().user;

    console.log("SAVE CALLED:", {
      user,
      balance,
      holdings,
      transactions,
      watchlist,
    });

    const body = {
      id: user.email,
      balance,
      holdings,
      transactions,
      watchlist,
    };

    console.log("SENDING TO SERVER:", body);

    try {
      const result = await api.put(
        `/userData/${encodeURIComponent(user.email)}`,
        body
      );

      console.log("PUT SUCCESS:", result);
      return result;
    } catch (err) {
      console.log("PUT FAILED:", err.status);

      if (err.status === 404) {
        const result = await api.post("/userData", body);
        console.log("POST SUCCESS:", result);
        return result;
      }

      throw err;
    }
  }
);

// ---------- Slice ----------

const initialSession = readSession();

const initialState = {
  user: initialSession,
  balance: 0,
  holdings: {},
  transactions: [],
  watchlist: [],
  status: initialSession ? "loading" : "idle", // idle | loading | ready | error
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout() {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem("accountType");
      return { ...initialState, user: null, status: "idle" };
    },

    toggleWatchlist(state, { payload: symbol }) {
      const i = state.watchlist.indexOf(symbol);
      if (i >= 0) state.watchlist.splice(i, 1);
      else state.watchlist.push(symbol);
    },

    applyBuy: {
      // id aur date reducer ke bahar bante hain, kyunki reducer pure hona chahiye
      prepare: (symbol, price, quantity) => ({
        payload: { symbol, price, quantity, id: makeId(), isoDate: new Date().toISOString() },
      }),
      reducer(state, { payload }) {
        const { symbol, price, quantity, id, isoDate } = payload;
        const cost = price * quantity;
        state.balance -= cost;

        const existing = state.holdings[symbol];
        if (!existing) {
          state.holdings[symbol] = {
            quantity,
            avgBuyPrice: price,
            buyDate: isoDate.split("T")[0],
          };
        } else {
          const existingQty = Number(existing.quantity) || 0;
          const existingAvg = Number(existing.avgBuyPrice) || 0;
          const totalQty = existingQty + quantity;
          existing.avgBuyPrice =
            totalQty > 0 ? (existingAvg * existingQty + cost) / totalQty : 0;
          existing.quantity = totalQty;
        }

        state.transactions.unshift({
          id, type: "BUY", symbol, quantity, price, total: cost, date: isoDate,
        });
      },
    },

    applySell: {
      prepare: (symbol, price, quantity) => ({
        payload: { symbol, price, quantity, id: makeId(), isoDate: new Date().toISOString() },
      }),
      reducer(state, { payload }) {
        const { symbol, price, quantity, id, isoDate } = payload;
        const existing = state.holdings[symbol];
        if (!existing) return;

        state.balance += price * quantity;

        const remaining = (Number(existing.quantity) || 0) - quantity;
        if (remaining === 0) {
          delete state.holdings[symbol];
        } else {
          existing.quantity = remaining;
          existing.avgBuyPrice = Number(existing.avgBuyPrice) || 0;
        }

        state.transactions.unshift({
          id, type: "SELL", symbol, quantity, price, total: price * quantity, date: isoDate,
        });
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserData.pending, (s) => { s.status = "loading"; })
      .addCase(loadUserData.fulfilled, (s, { payload }) => {
        s.user = payload.user;
        s.balance = payload.data.balance;
        s.holdings = payload.data.holdings;
        s.transactions = payload.data.transactions;
        s.watchlist = payload.data.watchlist;
        s.status = "ready";
      })
      .addCase(loadUserData.rejected, (s) => { s.status = "error"; });
  },
});

export const { logout, toggleWatchlist, applyBuy, applySell } = userSlice.actions;
export default userSlice.reducer;