

function FeatureSection({ variant,title,text,icon}) {
  return (
    <div className={variant}>
      <div className={variant === "one" ? "content-1" : "content-2"}>
        <div className="feature-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default FeatureSection;