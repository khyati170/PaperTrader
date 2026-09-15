import {features} from "../data/features";

function FeatureSection({ variant,title,text,icon}) {
  return (
    <section className="features-section">
      <h2 className="section-heading">What You Can Do</h2>
      <p className="section-subheading">Everything you need to learn the market, risk-free.</p>
      <div className="features-grid">
        {features.map((feature) => (
          <div className="feature-card" key={feature.id}>
            <div className="feature-icon-wrap">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
        </div>
    </section>
   
  );  
}

export default FeatureSection;