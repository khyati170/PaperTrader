import Hero from "../components/hero";
import FeatureSection from "../components/FeatureSection";

import HowItworks from "../components/HowItworks";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

function Home({ isAuthenticated }) {
  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <HowItworks />
      <FeatureSection/>
      <FinalCTA/>
      <Footer/>


      
    </>
  );
}

export default Home;