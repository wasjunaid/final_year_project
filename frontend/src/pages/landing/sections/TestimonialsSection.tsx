import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AppColors from "../../../constants/appColors";
import profileImage from "../../../assets/icons/profile.jpg";

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Medical Officer",
    avatar: profileImage,
    quote:
      "This platform has revolutionized how we manage patient records. The blockchain security gives us peace of mind.",
    rating: 5,
  },
  {
    name: "Dr. Michael Chen",
    role: "Healthcare IT Director",
    avatar: profileImage,
    quote:
      "The AI-powered coding system has significantly reduced our administrative workload and improved accuracy.",
    rating: 5,
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Primary Care Physician",
    avatar: profileImage,
    quote:
      "The scheduling system is intuitive and has greatly improved our patient management efficiency.",
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideInterval = useRef<number | null>(null);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );

  useEffect(() => {
    slideInterval.current = setInterval(nextSlide, 3000);
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="py-24"
      style={{ backgroundColor: AppColors.background }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-6"
            style={{ color: AppColors.primary }}
          >
            What Our Users Say
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${testimonials.length * 100}%`,
              transform: `translateX(-${
                currentIndex * (100 / testimonials.length)
              }%)`,
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="w-full flex-shrink-0 px-4"
                style={{ width: `${100 / testimonials.length}%` }}
              >
                <div
                  className="rounded-2xl p-8 text-center border shadow-lg h-full flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: AppColors.primary,
                    color: "white",
                    borderColor: AppColors.secondary,
                  }}
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 mb-5 object-cover"
                    style={{ borderColor: AppColors.secondary }}
                  />
                  <h3 className="text-2xl font-bold">{t.name}</h3>
                  <p className="text-md mt-1 text-[#FFFBDE]">{t.role}</p>
                  <div className="flex justify-center mt-3 text-[#FFFBDE] text-xl">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-lg italic mt-6 leading-relaxed text-[#FFFBDE]">
                    “{t.quote}”
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md text-gray-800 p-2 rounded-full hover:bg-gray-200 z-10"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md text-gray-800 p-2 rounded-full hover:bg-gray-200 z-10"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
