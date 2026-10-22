import { features } from "../data/features";

function FeatureSection() {
  return (
    <section className="features-section">
      <div className="features-inner">
        <p className="features-eyebrow">Features</p>
        <h2 className="features-title">
          Everything you need to learn the market, risk-free
        </h2>

        <div className="bento-grid">
          {features.map((feature) => (
            <article
              className={`bento-card bento-card-${feature.id}`}
              key={feature.id}
            >
              <div className="bento-icon">{feature.icon}</div>
              <div className="bento-body">
                <p className="bento-eyebrow">{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <p className="bento-text">{feature.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;