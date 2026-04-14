import React from "react";

export default function BusinessSection() {
  return (
    <div className="bg-white">
      <section className="max-w-6xl mx-auto text-center py-10 px-4">
        <div className="w-full flex justify-center">
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/4VtZJzu6lTsioWNxHT7InO/96f1940aef37c7cbab353650fbf89eed/UB_Case_Studies_Booz_Allen_image.png"
            alt="Booz Allen Hamilton Case Study"
            className="w-full max-h-[480px] object-contain rounded-lg mb-6"
          />
        </div>

        <h3 className="text-xl md:text-2xl font-semibold mb-2 px-4 md:px-10">
          Booz Allen Hamilton Unlocks Talent Retention and Productivity Through
          Upskilling
        </h3>
        {/* === Button === */}
        <div className="mt-6">
          <button className="bg-purple-600 text-white px-6 py-2 rounded font-semibold hover:bg-purple-700 transition">
            Read full story
          </button>
        </div>
      </section>

      {/* === Partner=== */}
      <section className="bg-[#1C1D1F] py-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gray-300 font-medium mb-6 text-sm md:text-base">
            Top companies choose{" "}
            <span className="text-white font-semibold">Udemy Business</span>
            to build in-demand career skills.
          </p>

          <div className="flex flex-wrap justify-center gap-10 items-center opacity-80 hover:opacity-100 transition">
            <img
              src="https://s.udemycdn.com/partner-logos/v4/nasdaq-light.svg"
              alt="Nasdaq"
              className="h-8 md:h-10 grayscale hover:grayscale-0 transition"
            />
            <img
              src="https://s.udemycdn.com/partner-logos/v4/volkswagen-light.svg"
              alt="Volkswagen"
              className="h-8 md:h-10 grayscale hover:grayscale-0 transition"
            />
            <img
              src="https://s.udemycdn.com/partner-logos/v4/netapp-light.svg"
              alt="NetApp"
              className="h-8 md:h-10 grayscale hover:grayscale-0 transition"
            />
            <img
              src="https://s.udemycdn.com/partner-logos/v4/eventbrite-light.svg"
              alt="Eventbrite"
              className="h-8 md:h-10 grayscale hover:grayscale-0 transition"
            />
          </div>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 px-6">
          {/* === Column 1 === */}
          <div>
            <h5 className="font-semibold text-white mb-3">In-demand Careers</h5>
            <ul className="space-y-1 text-sm">
              <li>Data Scientist</li>
              <li>Full Stack Web Developer</li>
              <li>Cloud Engineer</li>
              <li>Project Manager</li>
              <li>All Career Accelerators</li>
              <li>Devoops</li>
            </ul>
          </div>

          {/* === Column 2 === */}
          <div>
            <h5 className="font-semibold text-white mb-3">Web Development</h5>
            <ul className="space-y-1 text-sm">
              <li>JavaScript</li>
              <li>React.js</li>
              <li>Angular</li>
              <li>Java</li>
              <li>Node.js</li>
            </ul>
          </div>

          {/* === Column 3 === */}
          <div>
            <h5 className="font-semibold text-white mb-3">IT Certifications</h5>
            <ul className="space-y-1 text-sm">
              <li>Amazon AWS</li>
              <li>Azure</li>
              <li>Google Cloud</li>
              <li>Kubernetes</li>

            </ul>
          </div>

          {/* === Column 4 === */}
          <div>
            <h5 className="font-semibold text-white mb-3">Leadership</h5>
            <ul className="space-y-1 text-sm">
              <li>Leadership Skills</li>
              <li>Management</li>
              <li>Productivity</li>
              <li>Emotional Intelligence</li>
            
            </ul>
          </div>

          {/* === Column 5 === */}
          <div>
            <h5 className="font-semibold text-white mb-3">Communication</h5>
            <ul className="space-y-1 text-sm">
              <li>Public Speaking</li>
              <li>Presentation Skills</li>
              <li>Writing</li>
              <li>PowerPoint</li>
             </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
