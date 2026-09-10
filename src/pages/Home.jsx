import Hero from "../components/hero";
import FeatureSection from "../components/FeatureSection";
import { features } from "../data/features";
import HowItworks from "../components/HowItworks";

function Home() {
  return (
    <>
      <Hero />
      <HowItworks />

      {features.map((feature, index) => (
        <FeatureSection
          key={feature.id}
          variant={index % 2 === 0 ? "one" : "two"}
          icon={feature.icon}
          title={feature.title}
          text={feature.text}
        />
      ))}
    </>
  );
}

export default Home;