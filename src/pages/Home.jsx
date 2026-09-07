import Hero from "../components/Hero";
import FeatureSection from "../components/FeatureSection";
import { features } from "../data/features";

function Home() {
  return (
    <>
      <Hero />

      {features.map((feature, index) => (
        <FeatureSection
          key={feature.id}
          variant={index % 2 === 0 ? "one" : "two"}
          icon = {feature.icon}
          title={feature.title}
          text={feature.text}
        />
      ))}
    </>
  );
}

export default Home;