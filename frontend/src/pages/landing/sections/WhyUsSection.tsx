import React from "react";
import { FaShieldAlt, FaRocket, FaUsers } from "react-icons/fa";
import AppColors from "../../../constants/appColors";

const stats = [
  {
    title: "Hospitals",
    value: "500+",
    icon: <FaShieldAlt className="text-4xl mb-2 text-white" />,
  },
  {
    title: "Patient Records",
    value: "1M+",
    icon: <FaUsers className="text-4xl mb-2 text-white" />,
  },
  {
    title: "Efficiency Increase",
    value: "85%",
    icon: <FaRocket className="text-4xl mb-2 text-white" />,
  },
];

const benefits = [
  "Advanced blockchain security for patient data",
  "AI-powered medical coding with 99.9% accuracy",
  "Intuitive scheduling system reduces wait times by 60%",
  "Seamless integration with existing healthcare systems",
  "Real-time access to patient records",
  "24/7 technical support and training",
];

const WhyUsSection: React.FC = () => {
  return (
    <section
      id="why-us"
      className="py-24"
      style={{ backgroundColor: AppColors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: AppColors.primary }}
          >
            Why Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl p-6 text-center shadow-lg"
              style={{ backgroundColor: AppColors.primary }}
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-lg text-white mt-1">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-10">
          <h3
            className="text-2xl sm:text-3xl font-bold text-center mb-8"
            style={{ color: AppColors.primary }}
          >
            Key Benefits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div
                  className="w-3 h-3 mt-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: AppColors.secondary }}
                />
                <p className="text-gray-700 text-base">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
