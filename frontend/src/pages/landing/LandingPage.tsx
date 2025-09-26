import FeaturesSection from "./sections/FeaturesSection";
import Footer from "./sections/Footer";
import HeroSection from "./sections/HeroSection";
import Navbar from "./sections/Navbar";
import TestimonialsSection from "./sections/TestimonialsSection";
import WhyUsSection from "./sections/WhyUsSection";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <WhyUsSection />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
