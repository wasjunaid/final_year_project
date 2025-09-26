import React, { type JSX } from "react";
import { FaNotesMedical, FaRobot, FaCalendarAlt } from "react-icons/fa";
import AppColors from "../../../constants/appColors";

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <FaNotesMedical size={48} color="#ffffff" />,
    title: "Blockchain EHR",
    description:
      "Secure and transparent health records using advanced blockchain technology.",
  },
  {
    icon: <FaRobot size={48} color="#ffffff" />,
    title: "AI-Powered Coding",
    description:
      "Intelligent medical coding automation powered by advanced AI algorithms.",
  },
  {
    icon: <FaCalendarAlt size={48} color="#ffffff" />,
    title: "Smart Scheduling",
    description:
      "Efficient appointment management with intelligent scheduling system.",
  },
];

const FeaturesSection: React.FC = () => (
  <section
    id="features"
    className="py-24"
    style={{ backgroundColor: AppColors.background }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2
          className="text-4xl sm:text-5xl font-bold mb-6"
          style={{ color: AppColors.primary }}
        >
          Powerful Features
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="rounded-xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: AppColors.primary, color: "#fff" }}
          >
            <div className="flex justify-center mb-6">{feature.icon}</div>
            <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-base leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
