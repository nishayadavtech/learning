import React from "react";

export default function TrustedCompanies() {
  return (
    <section className="bg-gray-50 py-10">
      <div className="container mx-auto px-4 text-center">
        {/* === Heading === */}
        <p className="text-gray-600 mb-8 text-lg">
          Trusted by over <strong>17,000+</strong> companies and millions of
          learners around the world
        </p>

        {/* === Company Logo === */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center items-center">
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/3E0eIh3tWHNWADiHNBmW4j/3444d1a4d029f283aa7d10ccf982421e/volkswagen_logo.svg"
            alt="Volkswagen"
            className="h-12 w-auto object-contain"
          />
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/2pNyDO0KV1eHXk51HtaAAz/090fac96127d62e784df31e93735f76a/samsung_logo.svg"
            alt="Samsung"
            className="h-12 w-auto object-contain"
          />
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/1UUVZtTGuvw23MwEnDPUr3/2683579ac045486a0aff67ce8a5eb240/procter_gamble_logo.svg"
            alt="Procter & Gamble"
            className="h-12 w-auto object-contain"
          />
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/23XnhdqwGCYUhfgIJzj3PM/77259d1ac2a7d771c4444e032ee40d9e/vimeo_logo_resized-2.svg"
            alt="Vimeo"
            className="h-12 w-auto object-contain"
          />
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/3YzfvEjCAUi3bKHLW2h1h8/ec478fa1ed75f6090a7ecc9a083d80af/cisco_logo.svg"
            alt="Cisco"
            className="h-12 w-auto object-contain"
          />
          <img
            src="https://cms-images.udemycdn.com/96883mtakkm8/1GoAicYDYxxRPGnCpg93gi/a8b6190cc1a24e21d6226200ca488eb8/hewlett_packard_enterprise_logo.svg"
            alt="HP Enterprise"
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
