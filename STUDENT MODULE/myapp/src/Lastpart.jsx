import React from "react";

export default function Lastpart() {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
          See what others are achieving through learning
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ===== Card 1 ===== */}
          <div className="bg-white text-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <img
              src="https://cms-images.udemycdn.com/96883mtakkm8/1Djz6c0gZLaCG5SQS3PgUY/54b6fb8c85d8da01da95cbb94fa6335f/Alvin_Lim.jpeg"
              alt="user"
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
            />
            <p className="text-gray-600 text-sm mb-4">
              “Because of this course I was able to clear my two interviews...
              Thanks for making such wonderful content.”
            </p>
            <h6 className="font-semibold text-gray-900">Diksha S</h6>
            <small className="text-gray-500">Business Intelligence (BI)</small>
          </div>

          {/* ===== Card 2 ===== */}
          <div className="bg-white text-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <img
              src="https://cms-images.udemycdn.com/96883mtakkm8/6dT7xusLHYoOUizXeVqgUk/4317f63fe25b2e07ad8c70cda641014b/William_A_Wachlin.jpeg"
              alt="user"
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
            />
            <p className="text-gray-600 text-sm mb-4">
              “This has helped me so much in my career. I joined as a frontend
              engineer and eventually transitioned...”
            </p>
            <h6 className="font-semibold text-gray-900">Chetan B</h6>
            <small className="text-gray-500">Go (Golang) Course</small>
          </div>

          {/* ===== Card 3 ===== */}
          <div className="bg-white text-gray-800 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition">
            <img
              src="https://cms-images.udemycdn.com/96883mtakkm8/4w9dYD4F64ibQwsaAB01Z4/c4610e9b1ac65589d8b1374ad10714e2/Ian_Stevens.png"
              alt="user"
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
            />
            <p className="text-gray-600 text-sm mb-4">
              “Today, I am a software developer, and I credit a significant part
              of my success to the solid foundation laid by this course.”
            </p>
            <h6 className="font-semibold text-gray-900">Bhavik K</h6>
            <small className="text-gray-500">Java Course</small>
          </div>
        </div>
      </div>
    </section>
  );
}
