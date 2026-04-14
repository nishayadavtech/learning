import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaFilePdf,
  FaUpload,
  FaVideo,
} from "react-icons/fa";

const placeholderVideo =
  "https://www.w3schools.com/html/mov_bbb.mp4";
const placeholderPdf = "/sample-course.pdf";

export default function Coursedetail() {
  const { id } = useParams();
  const location = useLocation();
  const isTeacherView = location.pathname.startsWith("/teacher");

  const [course, setCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newOriginal, setNewOriginal] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState("");

  const fetchCourseDetail = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5500/course/course-detail/${id}`);
      setCourse(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  useEffect(() => {
    return () => {
      if (videoPreview && videoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }

      if (pdfPreview && pdfPreview.startsWith("blob:")) {
        URL.revokeObjectURL(pdfPreview);
      }
    };
  }, [pdfPreview, videoPreview]);

  const handleUpdatePrice = async () => {
    try {
      await axios.put(`http://localhost:5500/course/update-price/${id}`, {
        original_price: newOriginal,
        discount_price: newDiscount,
      });

      setShowModal(false);
      fetchCourseDetail();
    } catch (err) {
      console.error(err);
      alert("Failed to update price");
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (pdfPreview && pdfPreview.startsWith("blob:")) {
      URL.revokeObjectURL(pdfPreview);
    }

    setPdfFile(file);
    setPdfPreview(URL.createObjectURL(file));
  };

  if (!course) {
    return <div className="p-6">Loading...</div>;
  }

  const discountPercent =
    course.original_price && course.discount_price
      ? Math.round(
          ((course.original_price - course.discount_price) /
            course.original_price) *
            100
        )
      : 0;

  const imgUrl = course.image_url
    ? course.image_url.startsWith("http")
      ? course.image_url
      : `http://localhost:5500${course.image_url}`
    : "https://placehold.co/1200x500/e2e8f0/475569?text=Course+Preview";

  const displayVideo = videoPreview || placeholderVideo;
  const displayPdf = pdfPreview || placeholderPdf;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_42%,#ffffff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
          <div className="relative">
            <img
              src={imgUrl}
              alt={course.course_name}
              className="h-64 w-full object-cover md:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
                Course Details
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold md:text-4xl">
                {course.course_name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200 md:text-base">
                {course.description}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1.25fr_0.75fr] md:p-8">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Course Overview
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      Professional Course Snapshot
                    </h2>
                  </div>

                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    Duration: {course.duration || "Self-paced"}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Course Video
                      </p>
                      <div className="mt-4 overflow-hidden rounded-2xl bg-slate-950">
                        <video
                          controls
                          className="h-72 w-full object-cover"
                          src={displayVideo}
                        />
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        {videoFile
                          ? `${videoFile.name} ready for preview`
                          : "Static preview video available for teacher view."}
                      </p>
                  </div>

                  <div className="rounded-[28px] bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Course PDF
                        </p>
                        <a
                          href={displayPdf}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                        >
                          Open PDF
                        </a>
                      </div>
                      <div className="mt-4 h-[28rem] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        <object
                          data={displayPdf}
                          type="application/pdf"
                          className="h-full w-full"
                        >
                          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                            <FaFilePdf size={36} className="text-rose-600" />
                            <p className="max-w-sm text-sm text-slate-600">
                              PDF preview browser me direct load nahi ho raha. Neeche
                              button se PDF open karo.
                            </p>
                            <a
                              href={displayPdf}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                            >
                              Open PDF
                            </a>
                          </div>
                        </object>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        {pdfFile
                          ? `${pdfFile.name} ready for preview`
                          : "Static PDF preview available for teacher view."}
                      </p>
                  </div>
                </div>
              </section>

              {isTeacherView && (
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                        Teacher Assets
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Upload And Review Course Files
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Yahan se teacher static mode me video aur PDF select karke
                        turant preview dekh sakta hai.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <label className="rounded-3xl border border-dashed border-sky-300 bg-sky-50 p-5 transition hover:border-sky-500">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-white p-3 text-sky-600 shadow-sm">
                          <FaVideo size={22} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            Upload Course Video
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            MP4 ya lecture preview file choose karo. Select hote hi
                            upar preview dikh jayega.
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white">
                            <FaUpload size={14} />
                            Choose Video
                          </div>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </label>

                    <label className="rounded-3xl border border-dashed border-rose-300 bg-rose-50 p-5 transition hover:border-rose-500">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-white p-3 text-rose-600 shadow-sm">
                          <FaFilePdf size={22} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            Upload Course PDF
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Notes ya handbook PDF choose karo. Select karte hi PDF
                            viewer me dikh jayega.
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                            <FaUpload size={14} />
                            Choose PDF
                          </div>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Pricing
                </p>

                {course.original_price ? (
                  <>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-4xl font-bold text-emerald-400">
                        Rs. {course.discount_price}
                      </span>
                      <span className="pb-1 text-sm text-slate-400 line-through">
                        Rs. {course.original_price}
                      </span>
                    </div>

                    <div className="mt-4 inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
                      {discountPercent}% OFF
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-slate-300">Price not added yet.</p>
                )}

                {isTeacherView && (
                  <button
                    onClick={() => {
                      setNewOriginal(course.original_price || "");
                      setNewDiscount(course.discount_price || "");
                      setShowModal(true);
                    }}
                    className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Update Price
                  </button>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Files
                </p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Course Video</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Teacher video upload kare to yahin preview ho jayega.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">Course PDF</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Teacher PDF upload kare to yahin visible rahega.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Update Course Price</h2>
            <p className="mt-2 text-sm text-slate-500">
              Original aur discount price update karke course pricing refresh karo.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Original Price
                </label>
                <input
                  type="number"
                  value={newOriginal}
                  onChange={(e) => setNewOriginal(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Discount Price
                </label>
                <input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdatePrice}
                className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
