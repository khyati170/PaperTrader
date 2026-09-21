// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { demoAccount } from "../data/demoAccount";
// function Login({ onLogin }) {
//     const [mode, setMode] = useState("login"); // "login" | "signup"
//     const [showToast, setShowToast] = useState(false);
//     const [toastName, setToastName] = useState("");

//     // Signup fields
//     const [name, setName] = useState("");
//     const [age, setAge] = useState("");
//     const [phone, setPhone] = useState("");
//     const [signupEmail, setSignupEmail] = useState("");
//     const [signupPassword, setSignupPassword] = useState("");

//     // Login fields
//     const [loginId, setLoginId] = useState(""); // email OR phone
//     const [loginPassword, setLoginPassword] = useState("");

//     const navigate = useNavigate();
//     const location = useLocation();
//     const redirectTo = location.state?.from?.pathname || "/market";

//     const isValidEmail = (email) => {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return emailRegex.test(email);
//     };

//     const getUsers = () => {
//         const saved = localStorage.getItem("users");
//         return saved ? JSON.parse(saved) : [];
//     };

//     const saveUsers = (users) => {
//         localStorage.setItem("users", JSON.stringify(users));
//     };

//     const completeLogin = (user) => {
//     setToastName(user.name);

//     onLogin({
//         name: user.name,
//         email: user.email,
//         balance: user.balance ?? 50000,
//         holdings: user.holdings ?? [],
//         isDemo: user.isDemo ?? false,
//     });

//     setShowToast(true);

//     setTimeout(() => {
//         navigate(redirectTo, { replace: true });
//     }, 1800);
// };



//     const handleSignup = (e) => {
//         e.preventDefault();

//         if (!name || !age || !phone || !signupEmail || !signupPassword) {
//             alert("Please fill in all fields");
//             return;
//         }

//         if (!isValidEmail(signupEmail)) {
//             alert("Please enter a valid email address (e.g. name@gmail.com)");
//             return;
//         }

//         if (Number(age) < 5 || Number(age) > 120) {
//             alert("Please enter a valid age");
//             return;
//         }

//         if (!/^\d{10}$/.test(phone)) {
//             alert("Please enter a valid 10-digit phone number");
//             return;
//         }

//         const hasDigit = /\d/.test(signupPassword);
//         const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword);

//         if (signupPassword.length < 8) {
//             alert("Password must be at least 8 characters long");
//             return;
//         }

//         if (!hasDigit || !hasSpecialChar) {
//             alert("Password must contain at least one digit and one special character (e.g. ! @ # $ %)");
//             return;
//         }

//         const users = getUsers();

//         const alreadyExists = users.some(
//             (u) => u.email === signupEmail || u.phone === phone
//         );

//         if (alreadyExists) {
//             alert("An account with this email or phone number already exists. Please log in instead.");
//             setMode("login");
//             return;
//         }

//         const newUser = { name, age, phone, email: signupEmail, password: signupPassword };
//         saveUsers([...users, newUser]);

//         completeLogin(newUser);
//     };

//     const handleLoginSubmit = (e) => {
//         e.preventDefault();

//         if (!loginId || !loginPassword) {
//             alert("Please enter your email/phone and password");
//             return;
//         }

//         const users = getUsers();
//         const matchedUser = users.find(
//             (u) =>
//                 (u.email === loginId || u.phone === loginId) &&
//                 u.password === loginPassword
//         );

//         if (!matchedUser) {
//             alert("No account found with these details, or the password is incorrect.");
//             return;
//         }

//         completeLogin(matchedUser);
//     };

//     const handleDemoLogin = () => {
//     completeLogin(demoAccount);
// };



//     return (
//         <div className="auth-page">
//             {showToast && (
//                 <div className="login-toast">
//                     <span className="login-toast-icon">🎉</span>
//                     <div>
//                         <p className="login-toast-title">Welcome, {toastName}!</p>
//                         <p className="login-toast-text">
//                             You've got a virtual wallet of <strong>$50,000</strong> to start trading.
//                         </p>
//                     </div>
//                 </div>
//             )}

//             <div className="auth-card">
//                 <div className="auth-tabs">
//                     <button
//                         className={`auth-tab ${mode === "login" ? "active" : ""}`}
//                         onClick={() => setMode("login")}
//                     >
//                         Log In
//                     </button>
//                     <button
//                         className={`auth-tab ${mode === "signup" ? "active" : ""}`}
//                         onClick={() => setMode("signup")}
//                     >
//                         Sign Up
//                     </button>
//                 </div>

//                 {mode === "login" ? (
//                     <form className="auth-form" onSubmit={handleLoginSubmit}>
//                         <h2>Welcome back</h2>
//                         <p className="auth-subtext">Log in with your email or phone number</p>

//                         <label htmlFor="login-id">Email or Phone Number</label>
//                         <input
//                             id="login-id"
//                             type="text"
//                             value={loginId}
//                             onChange={(e) => setLoginId(e.target.value)}
//                             placeholder="you@example.com or 9876543210"
//                         />

//                         <label htmlFor="login-password">Password</label>
//                         <input
//                             id="login-password"
//                             type="password"
//                             value={loginPassword}
//                             onChange={(e) => setLoginPassword(e.target.value)}
//                             placeholder="••••••••"
//                         />

//                         <button className="buy-button auth-submit" type="submit">
//                             Log In
//                         </button>
//                         <div className="demo-divider">
//                             <span>OR</span>
//                         </div>

//                         <button
//                             className="demo-login-button"
//                             type="button"
//                             onClick={handleDemoLogin}
//                         >
//                             Try Demo Account
//                         </button>

//                         <p className="auth-switch-text">
//                             New here?{" "}
//                             <span onClick={() => setMode("signup")}>Create an account</span>
//                         </p>
//                     </form>
//                 ) : (
//                     <form className="auth-form" onSubmit={handleSignup}>
//                         <h2>Create your account</h2>
//                         <p className="auth-subtext">Start trading with a free $50,000 virtual wallet</p>

//                         <label htmlFor="name">Full Name</label>
//                         <input
//                             id="name"
//                             type="text"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             placeholder="Your full name"
//                         />

//                         <div className="auth-row">
//                             <div>
//                                 <label htmlFor="age">Age</label>
//                                 <input
//                                     id="age"
//                                     type="number"
//                                     value={age}
//                                     onChange={(e) => setAge(e.target.value)}
//                                     placeholder="Age"
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="phone">Phone Number</label>
//                                 <input
//                                     id="phone"
//                                     type="tel"
//                                     value={phone}
//                                     onChange={(e) => setPhone(e.target.value)}
//                                     placeholder="10-digit number"
//                                 />
//                             </div>
//                         </div>

//                         <label htmlFor="signup-email">Email</label>
//                         <input
//                             id="signup-email"
//                             type="email"
//                             value={signupEmail}
//                             onChange={(e) => setSignupEmail(e.target.value)}
//                             placeholder="you@example.com"
//                         />

//                         <label htmlFor="signup-password">Password</label>
//                         <input
//                             id="signup-password"
//                             type="password"
//                             value={signupPassword}
//                             onChange={(e) => setSignupPassword(e.target.value)}
//                             placeholder="At least 8 chars, 1 digit, 1 special char"
//                         />

//                         <button className="buy-button auth-submit" type="submit">
//                             Sign Up
//                         </button>

//                         <p className="auth-switch-text">
//                             Already have an account?{" "}
//                             <span onClick={() => setMode("login")}>Log in</span>
//                         </p>
//                     </form>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Login;


import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { demoAccount } from "../data/demoAccount";

function Login({ onLogin }) {
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [showToast, setShowToast] = useState(false);
    const [toastName, setToastName] = useState("");
    const [isDemoLogin, setIsDemoLogin] = useState(false);

    // Signup fields
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [phone, setPhone] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    // Login fields
    const [loginId, setLoginId] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo = location.state?.from?.pathname || "/market";

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const getUsers = () => {
        const saved = localStorage.getItem("users");
        return saved ? JSON.parse(saved) : [];
    };

    const saveUsers = (users) => {
        localStorage.setItem("users", JSON.stringify(users));
    };

    const completeLogin = (user) => {
        setToastName(user.name);
        setIsDemoLogin(user.isDemo ?? false);

        onLogin({
            name: user.name,
            email: user.email,
            balance: user.balance ?? 50000,
            holdings: user.holdings ?? [],
            isDemo: user.isDemo ?? false,
        });

        setShowToast(true);

        setTimeout(() => {
            navigate(redirectTo, { replace: true });
        }, 1800);
    };

    const handleDemoLogin = () => {
        completeLogin(demoAccount);
    };

    const handleSignup = (e) => {
        e.preventDefault();

        if (!name || !age || !phone || !signupEmail || !signupPassword) {
            alert("Please fill in all fields");
            return;
        }

        if (!isValidEmail(signupEmail)) {
            alert("Please enter a valid email address (e.g. name@gmail.com)");
            return;
        }

        if (Number(age) < 5 || Number(age) > 120) {
            alert("Please enter a valid age");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit phone number");
            return;
        }

        const hasDigit = /\d/.test(signupPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword);

        if (signupPassword.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        if (!hasDigit || !hasSpecialChar) {
            alert(
                "Password must contain at least one digit and one special character (e.g. ! @ # $ %)"
            );
            return;
        }

        const users = getUsers();

        const alreadyExists = users.some(
            (u) => u.email === signupEmail || u.phone === phone
        );

        if (alreadyExists) {
            alert(
                "An account with this email or phone number already exists. Please log in instead."
            );
            setMode("login");
            return;
        }

        const newUser = {
            name,
            age,
            phone,
            email: signupEmail,
            password: signupPassword,
        };

        saveUsers([...users, newUser]);
        completeLogin(newUser);
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();

        if (!loginId || !loginPassword) {
            alert("Please enter your email/phone and password");
            return;
        }

        const users = getUsers();

        const matchedUser = users.find(
            (u) =>
                (u.email === loginId || u.phone === loginId) &&
                u.password === loginPassword
        );

        if (!matchedUser) {
            alert(
                "No account found with these details, or the password is incorrect."
            );
            return;
        }

        completeLogin(matchedUser);
    };

    return (
        <div className="auth-page">
            {showToast && (
                <div className="login-toast">
                    <span className="login-toast-icon">🎉</span>

                    <div>
                        <p className="login-toast-title">
                            Welcome, {toastName}!
                        </p>

                        <p className="login-toast-text">
                            {isDemoLogin ? (
                                "Your demo portfolio is ready with pre-loaded holdings."
                            ) : (
                                <>
                                    You've got a virtual wallet of{" "}
                                    <strong>$50,000</strong> to start trading.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            )}

            <div className="auth-card">
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === "login" ? "active" : ""
                            }`}
                        onClick={() => setMode("login")}
                    >
                        Log In
                    </button>

                    <button
                        className={`auth-tab ${mode === "signup" ? "active" : ""
                            }`}
                        onClick={() => setMode("signup")}
                    >
                        Sign Up
                    </button>
                </div>

                {mode === "login" ? (
                    <form
                        className="auth-form"
                        onSubmit={handleLoginSubmit}
                    >
                        <h2>Welcome back</h2>

                        <p className="auth-subtext">
                            Log in with your email or phone number
                        </p>

                        <label htmlFor="login-id">
                            Email or Phone Number
                        </label>

                        <input
                            id="login-id"
                            type="text"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            placeholder="you@example.com or 9876543210"
                        />

                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) =>
                                setLoginPassword(e.target.value)
                            }
                            placeholder="••••••••"
                        />

                        <button
                            className="buy-button auth-submit"
                            type="submit"
                        >
                            Log In
                        </button>

                        <div className="demo-divider">
                            <span>OR</span>
                        </div>

                        <button
                            className="demo-login-button"
                            type="button"
                            onClick={handleDemoLogin}
                        >
                            Try Demo Account
                        </button>

                        <p className="auth-switch-text">
                            New here?{" "}
                            <span onClick={() => setMode("signup")}>
                                Create an account
                            </span>
                        </p>
                    </form>
                ) : (
                    <form
                        className="auth-form"
                        onSubmit={handleSignup}
                    >
                        <h2>Create your account</h2>

                        <p className="auth-subtext">
                            Start trading with a free $50,000 virtual wallet
                        </p>

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                        />

                        <div className="auth-row">
                            <div>
                                <label htmlFor="age">Age</label>

                                <input
                                    id="age"
                                    type="number"
                                    value={age}
                                    onChange={(e) =>
                                        setAge(e.target.value)
                                    }
                                    placeholder="Age"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value)
                                    }
                                    placeholder="10-digit number"
                                />
                            </div>
                        </div>

                        <label htmlFor="signup-email">
                            Email
                        </label>

                        <input
                            id="signup-email"
                            type="email"
                            value={signupEmail}
                            onChange={(e) =>
                                setSignupEmail(e.target.value)
                            }
                            placeholder="you@example.com"
                        />

                        <label htmlFor="signup-password">
                            Password
                        </label>

                        <input
                            id="signup-password"
                            type="password"
                            value={signupPassword}
                            onChange={(e) =>
                                setSignupPassword(e.target.value)
                            }
                            placeholder="At least 8 chars, 1 digit, 1 special char"
                        />

                        <button
                            className="buy-button auth-submit"
                            type="submit"
                        >
                            Sign Up
                        </button>

                        <p className="auth-switch-text">
                            Already have an account?{" "}
                            <span onClick={() => setMode("login")}>
                                Log in
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;


