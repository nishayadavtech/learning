import React from "react";

export default function CoursesSection() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-6">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">
          Learn essential career and life skills
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* ===== Card 1 ===== */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpzBu4x6VlPiFmKbICV3JOK9jYIiGZEtBCWg&s"
              alt="Generative AI"
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h5 className="text-xl font-semibold text-gray-800 mb-2">
                Generative AI
              </h5>
              <p className="text-gray-600">Over 1M+ learners</p>
            </div>
          </div>

          {/* ===== Card 2 ===== */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
            <img
              src="https://frontends.udemycdn.com/staticx/udemy/images/ai-career-banner/ai-career@2x.webp"
              alt="IT Certifications"
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h5 className="text-xl font-semibold text-gray-800 mb-2">
                IT Certifications
              </h5>cd 
              <p className="text-gray-600">Over 1.4M+ learners</p>
            </div>
          </div>

            {/* ===== Card 3 */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition hidden lg:block">
            <img
              src="https://img-c.udemycdn.com/course/480x270/567828_67d0.jpg"
              alt="Design Skills"
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h5 className="text-xl font-semibold text-gray-800 mb-2">
                Design Skills
              </h5>
              <p className="text-gray-600">Over 800K+ learners</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
