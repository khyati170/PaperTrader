const steps= [
    {number:1, title: "Sign Up", text: "Get your virtual balance instantly."},
    {
        number:2,title: "Browse & Trade", text :"Buy and sell real, live-tracked stocks."
    },
    {number:3,title:"Track & Learn", text :"Watch your portfolio grow, risk-free."},
];
function HowItworks(){
    return(
        <section className="how-it-works">
            <h2 className="section-heading">How It Works</h2>
            <div className="steps-grid">
                {steps.map((step) =>
                (
                    <div className="step" key={step.number}>
                    <div className="step-number">{step.number}</div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                    </div>
                )
                )}
            </div>
        </section>
    );
}

export default HowItworks;