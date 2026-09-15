import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Login({ onLogin }) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo = location.state?.from?.pathname || "/market";

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !age || !phone || !email || !password) {
            alert("Please fill in all fields");
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit phone number");
            return;
        }

        const hasDigit = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        if (!hasDigit || !hasSpecialChar) {
            alert("Password must contain at least one digit and one special character (e.g. ! @ # $ %)");
            return;
        }

        onLogin({ name, age, phone, email, balance: 50000 });
        setShowToast(true);

        setTimeout(() => {
            navigate(redirectTo, { replace: true });
        }, 1800);
    };

    return (
        <div className="stock-detail">
            {showToast && (
                <div className="login-toast">
                    <span className="login-toast-icon">🎉</span>
                    <div>
                        <p className="login-toast-title">Thanks for logging in, {name}!</p>
                        <p className="login-toast-text">
                            You've received a virtual wallet of <strong>$50,000</strong> to start trading.
                        </p>
                    </div>
                </div>
            )}

            <form className="trade-panel" onSubmit={handleSubmit} style={{ maxWidth: 380, margin: "60px auto" }}>
                <h2>Log In</h2>

                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                />

                <label htmlFor="age">Age</label>
                <input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                />

                <label htmlFor="phone">Phone Number</label>
                <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit phone number"
                />

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 chars, 1 digit, 1 special char"
                />

                <button className="buy-button" type="submit">
                    Log In
                </button>
            </form>
        </div>
    );
}

export default Login;