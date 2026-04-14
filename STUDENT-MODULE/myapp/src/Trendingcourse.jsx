import React from "react";

export default function Trendingcourse() {
  return (
    <div className="container mx-auto py-10 px-4">
      {/* ===== Career Accelerators Section ===== */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold mb-2">
          Ready to reimagine your career?
        </h3>
        <p className="text-gray-600 mb-6">
          Get the skills and real-world experience employers want with Career
          Accelerators.
        </p>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {[
            {
              img: "https://s.udemycdn.com/career-academies/careers/full-stack-web-developer/frontend-webdev-human.png",
              title: "Full Stack Web Developer",
              stats: "⭐ 4.7 | 481K ratings | 274 total hours",
            },
            {
              img: "https://s.udemycdn.com/career-academies/careers/digital-marketer/digital-marketer-hero.png",
              title: "Digital Marketer",
              stats: "⭐ 4.3 | 379K ratings | 281 total hours",
            },
            {
              img: "https://s.udemycdn.com/career-academies/careers/data-scientist/data-scientist-person.png",
              title: "Data Scientist",
              stats: "⭐ 4.8 | 252K ratings | 190 total hours",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white shadow-sm rounded-lg overflow-hidden text-center hover:shadow-md transition duration-300"
            >
              <div className="w-full bg-gray-50 flex justify-center items-center">
                <img
                  src={card.img}
                  alt={card.title}
                  className="max-h-48 w-auto object-contain p-3"
                />
              </div>
              <div className="p-4">
                <h6 className="font-semibold text-lg mb-1">{card.title}</h6>
                <p className="text-gray-500 text-sm">{card.stats}</p>
              </div>
            </div>
          ))}
        </div>

        {/* === Fixed Part === */}
        <div className="mt-4 text-right">
          <button
            onClick={() => alert("Career Accelerators page coming soon!")}
            className="text-blue-600 font-semibold hover:underline"
          >
            All Career Accelerators →
          </button>
        </div>
      </section>

      {/* ===== Trending Courses Section ===== */}
      <section className="mb-12">
        <h4 className="text-xl font-bold mb-6">Trending courses</h4>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
          {[
            {
              img: "https://img-c.udemycdn.com/course/480x270/2776760_f176_10.jpg",
              title: "100 Days of Code: The Complete Python Pro Bootcamp",
              author: "Dr. Angela Yu",
              rating: "4.7 | 382K ratings",
              price: "₹529",
            },
            {
              img: "https://img-c.udemycdn.com/course/480x270/625204_436a_3.jpg",
              title: "The Web Developer Bootcamp 2024",
              author: "Colt Steele",
              rating: "4.8 | 512K ratings",
              price: "₹529",
            },
            {
              img: "https://img-c.udemycdn.com/course/480x270/851712_fc61_6.jpg",
              title: "Java Programming Masterclass for Software Developers",
              author: "Tim Buchalka",
              rating: "4.6 | 235K ratings",
              price: "₹529",
            },
          ].map((course, i) => (
            <div
              key={i}
              className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition duration-300"
            >
              <div className="w-full bg-gray-50 flex justify-center items-center">
                <img
                  src={course.img}
                  alt={course.title}
                  className="max-h-40 w-auto object-contain p-2"
                />
              </div>
              <div className="p-4">
                <h6 className="font-semibold mb-1">{course.title}</h6>
                <p className="text-gray-500 text-sm mb-2">{course.author}</p>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    Bestseller
                  </span>
                  <span className="text-gray-500">{course.rating}</span>
                </div>
                <div className="font-semibold text-gray-800">{course.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
