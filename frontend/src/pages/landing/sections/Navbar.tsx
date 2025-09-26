import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import logo from "../../../assets/icons/JAW-transparent.png";
import AppColors from "../../../constants/appColors";
import ROUTES from "../../../constants/routes";

const Navbar: React.FC = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navHeight = 64;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveSection(sectionId);
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "features", "testimonials", "why-us"];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const { top, bottom } = el.getBoundingClientRect();
          if (top <= 100 && bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { id: "hero", label: "Home" },
    { id: "features", label: "Features" },
    { id: "testimonials", label: "Testimonials" },
    { id: "why-us", label: "Why Us" },
  ];

  const isHomePage = location.pathname === "/";

  return (
    <nav
      className="fixed w-full z-50 backdrop-blur-sm border-b shadow-md"
      style={{
        backgroundColor: AppColors.background,
        borderColor: AppColors.secondary,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to={ROUTES.HOME}>
              <img
                src={logo}
                alt="Logo"
                style={{ height: 45, width: "auto", marginLeft: 10 }}
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {isHomePage &&
              menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-3 py-2 text-base font-medium transition-all duration-300 ${
                    activeSection === item.id
                      ? "text-blue-900"
                      : "text-gray-600"
                  } hover:text-blue-900`}
                >
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 transition-all duration-300 ${
                      activeSection === item.id
                        ? "bg-blue-900 scale-x-100"
                        : "scale-x-0"
                    } origin-left`}
                    style={{
                      backgroundColor:
                        activeSection === item.id
                          ? AppColors.primary
                          : "transparent",
                      transformOrigin: "left",
                    }}
                  />
                  {item.label}
                </button>
              ))}

            <div className="flex items-center space-x-4">
              <Link
                to={ROUTES.AUTH.SIGN_IN}
                className="font-medium"
                style={{ color: AppColors.primary }}
              >
                Sign In
              </Link>
              <Link
                to={ROUTES.AUTH.SIGN_UP}
                className="text-white px-4 py-2 rounded-md font-medium transition"
                style={{ backgroundColor: AppColors.primary }}
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-3xl text-gray-700"
            >
              {menuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-2 bg-white shadow-md">
          {isHomePage &&
            menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-left px-3 py-2 text-base font-medium rounded transition-colors ${
                  activeSection === item.id
                    ? "text-blue-900 bg-gray-100"
                    : "text-gray-700"
                } hover:bg-gray-100`}
              >
                {item.label}
              </button>
            ))}

          <hr className="my-2 border-gray-200" />
          <div className="space-y-2">
            <Link
              to={ROUTES.AUTH.SIGN_IN}
              className="block text-sm font-medium text-gray-700 hover:text-blue-900"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.AUTH.SIGN_UP}
              className="block text-white text-center py-2 rounded-md font-medium"
              style={{ backgroundColor: AppColors.primary }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
