import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";
import AppColors from "../../../constants/appColors";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: ["About Us", "Contact", "Careers", "Press"],
    Product: ["Features", "Pricing", "Security", "API"],
    Resources: ["Documentation", "Support", "Blog", "Partners"],
    Legal: ["Privacy Policy", "Terms of Service", "Compliance", "Security"],
  };

  const socialLinks = [
    { icon: <FaFacebookF />, url: "#" },
    { icon: <FaTwitter />, url: "#" },
    { icon: <FaLinkedinIn />, url: "#" },
    { icon: <FaInstagram />, url: "#" },
  ];

  return (
    <footer
      className="text-white pt-16 pb-10"
      style={{ backgroundColor: AppColors.primary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Left Section */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">HealthCare</h3>
            <p className="text-sm text-gray-200 mb-6">
              Revolutionizing healthcare with blockchain and AI technology.
            </p>
            <div className="flex space-x-4 text-lg">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="hover:text-[#5A6FAE] transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-4">{category}</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="hover:text-[#5A6FAE] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between text-sm text-gray-300">
          <p>© {currentYear} HealthCare. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#5A6FAE]">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#5A6FAE]">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
