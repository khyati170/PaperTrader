const steps = [
    { number: 1, title: "Sign Up and get $100,000", text: " Create an account and your virtual balanceis ready. No card, no real money." },
    {
        number: 2, title: "Pick stocks and place trades", text: "Search, filter, and compare real stocks, then buy and sell at live prices."
    },
    { number: 3, title: "Review & Learn", text: "Track your portfolio, check the signals, and run what-if projections to see how your choices play out." },
];
function HowItworks() {
    return (
        <section className="how-it-works">
            <p className="how-eyebrow">How It Works</p>
            <h2 className="how-title">Start in three steps</h2>
            <ol className="steps-grid">

                {steps.map((step, i) => (
                    <li className="step" key={step.title}>
                        <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                    </li>
                )

                )}
            </ol>
        </section>
    );
}

export default HowItworks;