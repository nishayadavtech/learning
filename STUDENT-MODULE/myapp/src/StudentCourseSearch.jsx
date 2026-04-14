import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";

export default function StudentCourseSearch() {
  const baseUrl = "http://localhost:5500";

  /* ---------- STATES ---------- */
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [mode, setMode] = useState("keyword");
  const [resultsLimit, setResultsLimit] = useState(200);

  const [selected, setSelected] = useState(null);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [errorSelected, setErrorSelected] = useState(null);

  const originalPathRef = useRef(window.location.pathname);

  /* ---------- FETCH ALL COURSES ---------- */
  useEffect(() => {
    let mounted = true;

    axios.get(`${baseUrl}/course`)
      .then(res => mounted && setCourses(res.data || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  /* ---------- IMAGE URL ---------- */
  const getImageSrc = (url) => {
    if (!url) return "/uploads/default.png";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return baseUrl + url;
    return `${baseUrl}/uploads/${url}`;
  };

  /* ---------- FILTER COURSES ---------- */
  const filtered = useMemo(() => {
    if (!searchText) return courses.slice(0, resultsLimit);

    if (mode === "ids") {
      const ids = searchText.split(",").map(i => i.trim().toLowerCase());
      return courses
        .filter(c => ids.includes(String(c.course_id).toLowerCase()))
        .slice(0, resultsLimit);
    }

    const terms = searchText.toLowerCase().split(" ");

    return courses.filter(c => {
      const text = `${c.course_name} ${c.description} ${c.course_id}`.toLowerCase();
      return terms.some(t => text.includes(t));
    }).slice(0, resultsLimit);

  }, [courses, searchText, mode, resultsLimit]);

  /* ---------- URL CHECK ---------- */
  const checkUrl = async () => {
    const match = window.location.pathname.match(/\/student\/course\/([^/]+)/);
    if (match) {
      await showCourse(match[1], false);
    }
  };

  useEffect(() => {
    checkUrl();
    window.addEventListener("popstate", checkUrl);
    return () => window.removeEventListener("popstate", checkUrl);
  }, []);

  /* ---------- SHOW COURSE MODAL ---------- */
  const showCourse = async (id, push = true) => {
    setLoadingSelected(true);
    setSelected(null);
    setErrorSelected(null);

    try {
      if (push) {
        window.history.pushState({}, "", `/student/course/${id}`);
      }

      const res = await axios.get(`${baseUrl}/course/${id}`);

      let course = res.data.course || res.data;
      let teachers = res.data.teachers || [];

      if (!res.data.teachers && course?.course_id) {
        const tRes = await axios.get(`${baseUrl}/teachers?course_id=${course.course_id}`);
        teachers = tRes.data || [];
      }

      setSelected({ course, teachers });
    } catch (e) {
      setErrorSelected("Error fetching course");
    } finally {
      setLoadingSelected(false);
    }
  };

  /* ---------- CLOSE MODAL ---------- */
  const closeModal = () => {
    setSelected(null);
    setErrorSelected(null);

    if (window.location.pathname.startsWith("/student/course/")) {
      window.history.pushState({}, "", originalPathRef.current || "/");
    }
  };

  /* ---------- OPEN COURSE ---------- */
  const openCourse = (id, item) => {
    if (item?.teacher_name) {
      window.location.href = `/teacher/name/${item.teacher_name}`;
    } else {
      window.location.href = `/student/course/${id}`;
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
      <h2>Search Courses</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search courses"
          style={{ flex: 1 }}
        />

        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="keyword">Keyword</option>
          <option value="ids">IDs</option>
        </select>

        <input
          type="number"
          value={resultsLimit}
          onChange={e => setResultsLimit(+e.target.value)}
          style={{ width: 80 }}
        />
      </div>

      {loading ? <p>Loading…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12 }}>
          {filtered.map(c => (
            <div key={c.course_id} onClick={() => openCourse(c.course_id, c)}
              style={{ border: "1px solid #ddd", padding: 10, cursor: "pointer" }}>
              <img src={getImageSrc(c.image_url)} alt="" style={{ width: "100%", height: 140, objectFit: "cover" }} />
              <h4>{c.course_name} ({c.course_id})</h4>
              <p>{c.description?.slice(0, 100)}</p>
            </div>
          ))}
        </div>
      )}

      {(selected || loadingSelected || errorSelected) && (
        <div onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", margin: "5% auto", padding: 20, maxWidth: 800 }}>
            {loadingSelected && <p>Loading…</p>}
            {errorSelected && <p>{errorSelected}</p>}

            {selected && (
              <>
                <h2>{selected.course.course_name}</h2>
                <p>{selected.course.description}</p>

                <h3>Teachers</h3>
                {selected.teachers.map(t => (
                  <p key={t.id}>{t.name}</p>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
