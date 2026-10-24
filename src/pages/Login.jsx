import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { demoAccount } from "../data/demoAccount";
import { useToast } from "../context/ToastContext";
import FormField from "../components/FormField";

// ---------- Pure validation functions (component ke bahar) ----------
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateSignup = (v) => {
    const e = {};
    if (v.name.trim().length < 2) e.name = "Enter your full name";

    const age = Number(v.age);
    if (!v.age) e.age = "Age is required";
    else if (!Number.isInteger(age) || age < 5 || age > 120) e.age = "Enter a valid age (5-120)";

    if (!/^\d{10}$/.test(v.phone)) e.phone = "Enter a 10-digit phone number";
    if (!isValidEmail(v.email)) e.email = "Enter a valid email (e.g. name@gmail.com)";

    if (v.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!/\d/.test(v.password)) e.password = "Password needs at least one digit";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(v.password)) e.password = "Password needs one special character (! @ # $ %)";

    if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords do not match";
    return e;
};

const validateLogin = (v) => {
    const e = {};
    if (!v.id.trim()) e.id = "Enter your email or phone number";
    else if (v.id.includes("@") ? !isValidEmail(v.id) : !/^\d{10}$/.test(v.id))
        e.id = "Enter a valid email or 10-digit phone number";
    if (!v.password) e.password = "Enter your password";
    return e;
};

const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));

// Returning user ka last saved balance (App.jsx ki saved data se)
const getSavedBalance = (email) => {
    try {
        const raw = localStorage.getItem(`paperTrader:data:${email}`);
        if (!raw) return null;
        const balance = JSON.parse(raw).balance;
        return typeof balance === "number" ? balance : null;
    } catch {
        return null;
    }
};

const formatMoney = (n) =>
    `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const emptySignup = { name: "", age: "", phone: "", email: "", password: "", confirmPassword: "" };

function Login({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [signup, setSignup] = useState(emptySignup);
    const [login, setLogin] = useState({ id: "", password: "" });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const redirectTo = location.state?.from?.pathname || "/market";

    // Ek hi function sabhi inputs ke liye: field ka naam leke state update karta hai
    const updateSignup = (field) => (e) =>
        setSignup((prev) => ({ ...prev, [field]: e.target.value }));
    const updateLogin = (field) => (e) =>
        setLogin((prev) => ({ ...prev, [field]: e.target.value }));

    // Age: sirf digits allowed (-, ., e type hi nahi honge), max 3 digits
    const updateAge = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 3);
        setSignup((prev) => ({ ...prev, age: digitsOnly }));
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setErrors({});
        setFormError("");
    };

    const completeLogin = (user, isNewUser = false) => {
        // Saved balance login se PEHLE padhna hai (purane trades ke baad ka balance)
        const saved = isNewUser ? null : getSavedBalance(user.email);

        onLogin({
            name: user.name,
            email: user.email,
            balance: user.balance ?? 50000,
            holdings: user.holdings ?? [],
            isDemo: user.isDemo ?? false,
        });

        let message;
        if (isNewUser) {
            message = `Welcome, ${user.name}! $50,000 virtual cash has been added to your wallet.`;
        } else if (saved !== null) {
            // Returning user (ya demo jisme pehle trade ho chuka hai)
            message = `You are successfully logged in, ${user.name}! Your wallet balance is ${formatMoney(saved)}.`;
        } else if (user.isDemo) {
            message = `Welcome, ${user.name}! Your demo portfolio is ready.`;
        } else {
            message = `You are successfully logged in, ${user.name}!`;
        }

        showToast(message, "success");
        navigate(redirectTo, { replace: true });
    };

    const handleSignup = (e) => {
        e.preventDefault();
        const found = validateSignup(signup);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        const users = getUsers();
        const exists = users.some((u) => u.email === signup.email || u.phone === signup.phone);
        if (exists) {
            showToast("An account with this email or phone already exists. Please log in.", "error");
            switchMode("login");
            return;
        }

        const newUser = {
            name: signup.name.trim(), age: signup.age, phone: signup.phone,
            email: signup.email, password: signup.password,
        };
        saveUsers([...users, newUser]);
        completeLogin(newUser, true);
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        const found = validateLogin(login);
        setErrors(found);
        setFormError("");
        if (Object.keys(found).length > 0) return;

        const matched = getUsers().find(
            (u) => (u.email === login.id || u.phone === login.id) && u.password === login.password
        );
        if (!matched) {
            setFormError("No account found with these details, or the password is incorrect.");
            return;
        }
        completeLogin(matched);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-tabs">
                    <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
                        Log In
                    </button>
                    <button className={`auth-tab ${mode === "signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>
                        Sign Up
                    </button>
                </div>

                {mode === "login" ? (
                    <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
                        <h2>Welcome back</h2>
                        <p className="auth-subtext">Log in with your email or phone number</p>

                        {formError && <p className="form-error">{formError}</p>}

                        <FormField id="login-id" label="Email or Phone Number"
                            value={login.id} onChange={updateLogin("id")}
                            placeholder="you@example.com or 9876543210" error={errors.id} />

                        <FormField id="login-password" label="Password" type="password"
                            value={login.password} onChange={updateLogin("password")}
                            placeholder="••••••••" error={errors.password} />

                        <button className="buy-button auth-submit" type="submit">Log In</button>

                        <div className="demo-divider"><span>OR</span></div>

                        <button className="demo-login-button" type="button" onClick={() => completeLogin(demoAccount)}>
                            Try Demo Account
                        </button>

                        <p className="auth-switch-text">
                            New here? <span onClick={() => switchMode("signup")}>Create an account</span>
                        </p>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleSignup} noValidate>
                        <h2>Create your account</h2>
                        <p className="auth-subtext">Start trading with a free $50,000 virtual wallet</p>

                        <FormField id="name" label="Full Name"
                            value={signup.name} onChange={updateSignup("name")}
                            placeholder="Your full name" error={errors.name} />

                        <div className="auth-row">
                            <div>
                                <FormField id="age" label="Age" type="text" inputMode="numeric"
                                    value={signup.age} onChange={updateAge}
                                    placeholder="Age" error={errors.age} />
                            </div>
                            <div>
                                <FormField id="phone" label="Phone Number" type="tel"
                                    value={signup.phone} onChange={updateSignup("phone")}
                                    placeholder="10-digit number" error={errors.phone} />
                            </div>
                        </div>

                        <FormField id="signup-email" label="Email" type="email"
                            value={signup.email} onChange={updateSignup("email")}
                            placeholder="you@example.com" error={errors.email} />

                        <FormField id="signup-password" label="Password" type="password"
                            value={signup.password} onChange={updateSignup("password")}
                            placeholder="At least 8 chars, 1 digit, 1 special char" error={errors.password} />

                        <FormField id="confirm-password" label="Confirm Password" type="password"
                            value={signup.confirmPassword} onChange={updateSignup("confirmPassword")}
                            placeholder="Re-enter your password" error={errors.confirmPassword} />

                        <button className="buy-button auth-submit" type="submit">Sign Up</button>

                        <p className="auth-switch-text">
                            Already have an account? <span onClick={() => switchMode("login")}>Log in</span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;