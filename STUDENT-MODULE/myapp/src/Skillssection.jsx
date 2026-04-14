import React, { useState } from "react";

export default function SkillsSection() {
  const [activeTab, setActiveTab] = useState("AI");

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        {/* ===== Heading Section ===== */}
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">
          Skills to transform your career and life
        </h3>
        <p className="text-center text-gray-500 mb-8">
          From critical skills to technical topics, Udemy supports your
          professional development.
        </p>

        {/* ===== Tabs Section ===== */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            "Artificial Intelligence (AI)",
            "Python",
            "Microsoft Excel",
            "Digital Marketing",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full border font-medium transition-all ${
                activeTab === tab
                  ? "bg-black text-white border-black"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== Cards Section ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
         
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden">
            <div className="w-full h-52 overflow-hidden">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6Bq4UXtd5hy_2bKey8T526pLH-6150DOthQ&s"
                alt="AI Bootcamp"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h5 className="text-lg font-semibold mb-2">
                The AI Engineer Bootcamp
              </h5>
              <p className="text-gray-700">
                ₹529 <s className="text-gray-400 ml-1">₹3,719</s>
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden">
            <div className="w-full h-52 overflow-hidden">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpDzW2agLlRD2tnoz9rI_tvcsiKZWx1GOTCQ&s"
                alt="Intro to AI Agents"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h5 className="text-lg font-semibold mb-2">
                Intro to AI Agents
              </h5>
              <p className="text-gray-700">
                ₹529 <s className="text-gray-400 ml-1">₹3,719</s>
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden">
            <div className="w-full h-52 overflow-hidden">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhopTNH2IZZdg_A4EN6HeF2Y7Y3XLiU3JyxQ&s"
                alt="AI for Business"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h5 className="text-lg font-semibold mb-2">
                AI Powered Salesforce
              </h5>
              <p className="text-gray-700">
                ₹519 <s className="text-gray-400 ml-1">₹1,759</s>
              </p>
            </div>
          </div>
        </div>

        {/* ===== Bottom Link ===== */}
        <p className="text-center mt-6 text-indigo-600 font-semibold hover:underline cursor-pointer">
          Show all Artificial Intelligence (AI) courses 
        </p>
      </div>
    </section>
  );
}
