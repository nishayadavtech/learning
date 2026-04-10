import React from "react";

export default function Home() {
  return (
    <section className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center">
          {/* ===== Left===== */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Master tomorrow's skills today
            </h1>
            <p className="text-lg mb-6">
              Power up your AI, career, and life skills with expert-led learning.
            </p>
            <div className="space-x-4">
              <button className="bg-white text-gray-900 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-100 transition">
                Get started
              </button>
              <button className="border border-white text-white font-semibold px-6 py-2 rounded-full hover:bg-white hover:text-gray-900 transition">
                Learn AI
              </button>
            </div>
          </div>

          {/* ===== Right Image ===== */}
          <div className="md:w-1/2">
            <img
              src="https://s.udemycdn.com/browse_components/billboard/fallback_banner_image_udlite.jpg"
              alt="Hero"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
