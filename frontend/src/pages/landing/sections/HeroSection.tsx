import React from "react";
import heroBackground from "../../../assets/images/landing-hero-section.png";
import AppColors from "../../../constants/appColors";

const HeroSection: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(36, 53, 93, 0.6), rgba(36, 53, 93, 0.6)), url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#fff",
      }}
    >
      <div className="relative text-center px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
          style={{ color: AppColors.background }}
        >
          Revolutionizing Healthcare
          <span className="block mt-4 text-xl sm:text-2xl lg:text-3xl font-medium">
            Secure Blockchain EHR with AI-Powered Coding
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
          Transform your healthcare experience with our cutting-edge blockchain
          technology and intelligent medical coding powered by AI.
        </p>

        <div className="mt-10 flex justify-center flex-wrap gap-4">
          <button
            className="bg-[#24355d] text-white hover:bg-[#5A6FAE] hover:text-white min-w-[160px] h-[48px] px-6 text-base font-semibold rounded transition duration-300"
            onClick={() => scrollToSection("features")}
            style={{ backgroundColor: AppColors.primary }}
          >
            Get Started
          </button>
          <button
            className="border border-white text-white hover:bg-[#5A6FAE] hover:text-white min-w-[160px] h-[48px] px-6 text-base font-semibold rounded transition duration-300"
            onClick={() => scrollToSection("why-us")}
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
