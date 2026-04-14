import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Alert, Button, Card, Col, Form, Ratio, Row } from "react-bootstrap";
import { FaBookOpen, FaPen, FaPlus, FaTrash, FaUpload, FaVideo } from "react-icons/fa6";
import {
  getLocalTeacherTopics,
  mergeSyllabusData,
  normalizeTopic,
  saveLocalTeacherTopics,
} from "./teacherDataStorage";

const API = "http://localhost:5500";

const initialForm = {
  syllabus_id: "",
  course_id: "",
  topic_name: "",
  description: "",
  video_url: "",
  video_name: "",
  videos: [],
};

const isDirectVideoUrl = (url = "") =>
  /^data:video\//.test(url) || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

const getYoutubeEmbedUrl = (url = "") => {
  const match = url
    .trim()
    .match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([^?&/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

const fileToDataUrl = async (file) => {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const res = await fetch("http://localhost:5500/upload-video", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    return data.video_url; // 👈 अब base64 नहीं, URL आएगा
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Video upload failed");
  }
};

const VideoPreview = ({ url, title }) => {
  const youtubeUrl = getYoutubeEmbedUrl(url);
  const boxStyle = {
    minHeight: "180px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  };

  if (!url) {
    return (
      <div
        className="rounded-4 d-flex align-items-center justify-content-center text-muted"
        style={{ ...boxStyle, border: "1px dashed #cbd5e1" }}
      >
        Video preview
      </div>
    );
  }

  if (isDirectVideoUrl(url)) {
    return (
      <div className="overflow-hidden rounded-4" style={{ ...boxStyle, background: "#0f172a" }}>
        <video
          src={url}
          controls
          className="w-100"
          style={{ height: "180px", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  if (youtubeUrl) {
    return (
      <div className="overflow-hidden rounded-4" style={boxStyle}>
        <Ratio aspectRatio="16x9">
          <iframe title={title} src={youtubeUrl} allowFullScreen style={{ border: 0 }} />
        </Ratio>
      </div>
    );
  }

  return (
    <div className="rounded-4 d-flex align-items-center justify-content-center" style={boxStyle}>
      <a href={url} target="_blank" rel="noreferrer" className="btn btn-dark rounded-pill px-4">
        Open Video
      </a>
    </div>
  );
};

const TeacherSyllabus = () => {
  const [courses, setCourses] = useState([]);
  const [remoteTopics, setRemoteTopics] = useState([]);
  const [localTopics, setLocalTopics] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activePreviewByTopic, setActivePreviewByTopic] = useState({});
  const [formData, setFormData] = useState(initialForm);
  const editorFileInputRef = useRef(null);
  const token = localStorage.getItem("teacherToken");

  useEffect(() => {
    const storedTopics = getLocalTeacherTopics();
    setLocalTopics(Array.isArray(storedTopics) ? storedTopics : []);
  }, []);

  const persistLocalTopics = (updater) => {
    setLocalTopics((currentTopics) => {
      const nextTopics =
        typeof updater === "function" ? updater(currentTopics) : updater;
      saveLocalTeacherTopics(nextTopics);
      return nextTopics;
    });
  };

  const fetchCourses = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API}/course/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (fetchError) {
      console.error("Error fetching courses:", fetchError);
      setCourses([]);
    }
  }, [token]);

  const fetchSyllabus = useCallback(async () => {
    if (!token) {
      setError("You are not logged in as a teacher.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API}/syllabus/my-syllabus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRemoteTopics(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (fetchError) {
      console.error("Error fetching syllabus:", fetchError);
      setRemoteTopics([]);
      setError("Backend syllabus load failed. Local changes are still available.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCourses();
    fetchSyllabus();
  }, [fetchCourses, fetchSyllabus]);

  const syllabusData = useMemo(
    () => mergeSyllabusData(remoteTopics, localTopics),
    [remoteTopics, localTopics]
  );

  const topicCount = syllabusData.length;
  const tutorialCount = syllabusData.reduce((total, topic) => total + (topic.videos?.length || 0), 0);

  const getCourseName = (courseId) => {
    const course = courses.find((item) => String(item.course_id) === String(courseId));
    return course ? course.course_name : `Course ${courseId}`;
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditMode(false);
    if (editorFileInputRef.current) {
      editorFileInputRef.current.value = "";
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const upsertTopic = (nextTopic) => {
    const normalized = normalizeTopic({
      ...nextTopic,
      updated_at: new Date().toISOString(),
      isLocalOnly: true,
    });

    persistLocalTopics((currentTopics) => {
      const remainingTopics = currentTopics.filter(
        (item) => String(item.syllabus_id) !== String(normalized.syllabus_id)
      );
      return [...remainingTopics, normalized];
    });
  };

  const handleEditorVideoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      const nextVideoId = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setFormData((current) => ({
        ...current,
        video_name: file.name,
        video_url: dataUrl,
        videos: current.videos?.length
          ? current.videos.map((video, index) =>
              index === 0
                ? {
                    ...video,
                    video_id: video.video_id || nextVideoId,
                    video_name: file.name,
                    video_url: dataUrl,
                  }
                : video
            )
          : [
              {
                video_id: nextVideoId,
                video_name: file.name,
                video_url: dataUrl,
              },
            ],
      }));
      setError("");
    } catch (uploadError) {
      console.error(uploadError);
      setError("Selected video could not be saved.");
    }
  };

  const handleRemoveSelectedVideo = () => {
    setFormData((current) => ({
      ...current,
      video_name: "",
      video_url: "",
      videos: [],
    }));

    if (editorFileInputRef.current) {
      editorFileInputRef.current.value = "";
    }
  };
  const handleTopicVideoUpload = async (topic, event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const dataUrl = await fileToDataUrl(file);

    const nextVideo = {
      video_id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      video_name: file.name,
      video_url: dataUrl,
    };

    // 🔥 FIX START
    const updatedVideos = [...(topic.videos || []), nextVideo];

    upsertTopic({
      ...topic,
      video_name: updatedVideos[0]?.video_name || file.name,
      video_url: updatedVideos[0]?.video_url || nextVideo.video_url,
      videos: updatedVideos,
    });
    // 🔥 FIX END

    setActivePreviewByTopic((current) => ({
      ...current,
      [String(topic.syllabus_id)]: nextVideo.video_id,
    }));

    setError("");
  } catch (uploadError) {
    console.error(uploadError);
    setError("Video upload failed. Please try again.");
  } finally {
    event.target.value = "";
  }
};

  const handleEdit = (topic) => {
    setEditMode(true);
    setFormData({
      syllabus_id: topic.syllabus_id,
      course_id: topic.course_id,
      topic_name: topic.topic_name,
      description: topic.description,
      video_url: topic.video_url || "",
      video_name: topic.video_name || "",
      videos: topic.videos || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveTopicVideo = (topic, videoId) => {
    if (!window.confirm(`Remove video from "${topic.topic_name}"?`)) return;

    const remainingVideos = (topic.videos || []).filter(
      (video) => String(video.video_id) !== String(videoId)
    );
    const primaryVideo = remainingVideos[0] || { video_name: "", video_url: "" };

    upsertTopic({
      ...topic,
      video_name: primaryVideo.video_name,
      video_url: primaryVideo.video_url,
      videos: remainingVideos,
    });

    setActivePreviewByTopic((current) => {
      const topicKey = String(topic.syllabus_id);
      const nextPreviewMap = { ...current };
      const currentPreviewId = current[topicKey];

      if (String(currentPreviewId) === String(videoId)) {
        if (remainingVideos[0]?.video_id) {
          nextPreviewMap[topicKey] = remainingVideos[0].video_id;
        } else {
          delete nextPreviewMap[topicKey];
        }
      }

      return nextPreviewMap;
    });
  };

  const handleDeleteTopic = (topic) => {
    if (!window.confirm(`Delete "${topic.topic_name}"?`)) return;

    const normalized = normalizeTopic({
      ...topic,
      deleted: true,
      updated_at: new Date().toISOString(),
    });

    persistLocalTopics((currentTopics) => {
      const remainingTopics = currentTopics.filter(
        (item) => String(item.syllabus_id) !== String(topic.syllabus_id)
      );
      return [...remainingTopics, normalized];
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.course_id || !formData.topic_name.trim()) {
      setError("Course and topic name are required.");
      return;
    }

    const topicId =
      formData.syllabus_id ||
      `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    upsertTopic({
      ...formData,
      syllabus_id: topicId,
      course_id: formData.course_id,
      videos:
        formData.videos?.length > 0
          ? formData.videos
          : formData.video_name || formData.video_url
            ? [
                {
                  video_id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  video_name: formData.video_name,
                  video_url: formData.video_url,
                },
              ]
            : [],
    });

    resetForm();
    setError("");
  };

  return (
    <div
      className="py-3 px-3 px-lg-4"
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        overflowX: "hidden",
        minHeight: "100%",
      }}
    >
      {error && <Alert variant="warning">{error}</Alert>}

      <Card
        className="border-0 rounded-5 shadow-sm mb-4"
        style={{ boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)" }}
      >
        <Card.Body className="p-3 p-md-4 p-lg-5">
          <Row className="g-4 align-items-center text-center text-lg-start">
            <Col lg={7}>
              <div className="small text-uppercase fw-semibold text-primary mb-2">
                Teacher Syllabus
              </div>
              <h2 className="fw-bold mb-2" style={{ color: "#0f172a" }}>
                Simple topic and tutorial manager
              </h2>
            </Col>
            <Col lg={5}>
              <Row className="g-2 g-sm-3 justify-content-center">
                <Col xs={4} sm={4}>
                  <div
                    className="rounded-4 p-2 p-sm-3 h-100 shadow-sm"
                    style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
                  >
                    <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>Courses</div>
                    <div className="fw-bold fs-4 fs-sm-3" style={{ color: "#0f172a" }}>
                      {courses.length}
                    </div>
                  </div>
                </Col>
                <Col xs={4} sm={4}>
                  <div
                    className="rounded-4 p-2 p-sm-3 h-100 shadow-sm"
                    style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
                  >
                    <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>Topics</div>
                    <div className="fw-bold fs-4 fs-sm-3" style={{ color: "#0f172a" }}>
                      {topicCount}
                    </div>
                  </div>
                </Col>
                <Col xs={4} sm={4}>
                  <div
                    className="rounded-4 p-2 p-sm-3 h-100 shadow-sm"
                    style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
                  >
                    <div className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>Tutorials</div>
                    <div className="fw-bold fs-4 fs-sm-3" style={{ color: "#0f172a" }}>
                      {tutorialCount}
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3 align-items-start">
        <Col lg={5} xl={4}>
          <Card
            className="border-0 rounded-5 shadow-sm"
            style={{ boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)" }}
          >
            <Card.Body className="p-3 p-lg-4">
              <div className="mb-3">
                <div className="small text-uppercase text-muted fw-semibold">Topic Form</div>
                <h4 className="mb-1 fw-bold">{editMode ? "Update Topic" : "Add New Topic"}</h4>
                <div className="text-muted small">
                  Course select karke topic aur first tutorial add kijiye.
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <Form.Label className="fw-semibold">Course</Form.Label>
                  <Form.Select
                    value={formData.course_id}
                    onChange={(e) => handleInputChange("course_id", e.target.value)}
                    className="rounded-4 py-2"
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="mb-3">
                  <Form.Label className="fw-semibold">Topic Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.topic_name}
                    onChange={(e) => handleInputChange("topic_name", e.target.value)}
                    placeholder="Enter topic name"
                    className="rounded-4 py-2"
                  />
                </div>

                <div className="mb-3">
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Short topic description"
                    className="rounded-4"
                  />
                </div>

                <div className="mb-3">
                  <Form.Label className="fw-semibold">Video Link</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => handleInputChange("video_url", e.target.value)}
                    placeholder="Paste video link if needed"
                    className="rounded-4 py-2"
                  />
                </div>

                <div className="border rounded-4 p-3 mb-3" style={{ background: "#f8fafc" }}>
                  <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-2">
                    <div className="fw-semibold">Video</div>
                    <div className="d-flex gap-2 flex-wrap">
                      <label className="btn btn-dark rounded-pill px-3 py-2 mb-0">
                        <FaUpload className="me-2" />
                        Add Video
                        <input
                          ref={editorFileInputRef}
                          type="file"
                          accept="video/*"
                          hidden
                          onChange={handleEditorVideoChange}
                        />
                      </label>
                      {(formData.video_url || formData.video_name) && (
                        <Button
                          type="button"
                          variant="light"
                          className="rounded-pill px-3 py-2 text-danger"
                          onClick={handleRemoveSelectedVideo}
                        >
                          Remove Video
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="small text-muted mb-3">
                    {formData.video_name || "No video selected"}
                  </div>

                  <VideoPreview url={formData.video_url} title={formData.topic_name || "Preview"} />
                </div>

                <div className="d-flex gap-2">
                  <Button type="submit" className="btn-dark border-0 rounded-pill px-4">
                    {editMode ? "Update" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    className="rounded-pill px-4"
                    onClick={resetForm}
                  >
                    Clear
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7} xl={8}>
          {loading && <Alert variant="info">Loading syllabus...</Alert>}

          <div className="d-grid gap-3">
            {!loading && syllabusData.length > 0 ? (
              syllabusData.map((item) => {
                const topicVideos = item.videos || [];
                const hasVideo = topicVideos.length > 0 || Boolean(item.video_url || item.video_name);
                const selectedPreviewId = activePreviewByTopic[String(item.syllabus_id)];
                const previewVideo =
                  topicVideos.find(
                    (video) => String(video.video_id) === String(selectedPreviewId)
                  // ) || topicVideos[0] || null;
                   ) || topicVideos[topicVideos.length - 1] || null;

                return (
                  <Card
                    key={item.syllabus_id}
                    className="border-0 rounded-5 shadow-sm"
                    style={{ boxShadow: "0 18px 48px rgba(15, 23, 42, 0.06)" }}
                  >
                    <Card.Body className="p-4">
                      <Row className="g-3 align-items-start">
                        <Col lg={7}>
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                            <span className="small text-primary fw-semibold d-inline-flex align-items-center gap-2">
                              <FaBookOpen />
                              {getCourseName(item.course_id)}
                            </span>
                            <span
                              className="rounded-pill px-3 py-1 small"
                              style={{ background: "#f1f5f9", color: "#475569" }}
                            >
                              {topicVideos.length} tutorial{topicVideos.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          <h5 className="fw-bold mb-2">{item.topic_name}</h5>
                          <p className="text-muted mb-3">
                            {item.description || "No description added yet."}
                          </p>

                          <div className="d-grid gap-2 mb-3">
                            {topicVideos.length > 0 ? (
                              topicVideos.map((video, index) => (
                                <div
                                  key={video.video_id || index}
                                  className="d-flex justify-content-between align-items-center gap-2 flex-wrap rounded-4 px-3 py-2"
                                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                                >
                                  <button
                                    type="button"
                                    className="border-0 bg-transparent text-start p-0 flex-grow-1"
                                    onClick={() =>
                                      setActivePreviewByTopic((current) => ({
                                        ...current,
                                        [String(item.syllabus_id)]: video.video_id,
                                      }))
                                    }
                                    style={{ minWidth: 0 }}
                                  >
                                    <span
                                      className="small d-inline-flex align-items-center rounded-pill px-3 py-2"
                                      style={{
                                        color: "#334155",
                                        wordBreak: "break-word",
                                        background:
                                          String(previewVideo?.video_id) === String(video.video_id)
                                            ? "#dbeafe"
                                            : "transparent",
                                      }}
                                    >
                                      <FaVideo className="me-2" />
                                      {video.video_name || `Video ${index + 1}`}
                                    </span>
                                  </button>
                                  <Button
                                    variant="light"
                                    className="rounded-pill px-3 py-1 text-danger"
                                    onClick={() => handleRemoveTopicVideo(item, video.video_id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <span
                                className="rounded-pill px-3 py-2 small"
                                style={{ background: "#e2e8f0", color: "#475569", width: "fit-content" }}
                              >
                                <FaVideo className="me-2" />
                                No video
                              </span>
                            )}
                          </div>

                          <div className="d-flex gap-2 flex-wrap">
                            <label className="btn btn-dark rounded-pill px-3 py-2 mb-0">
                              <FaPlus className="me-2" />
                              {hasVideo ? "Add More Video" : "Add Video"}
                              <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={(event) => handleTopicVideoUpload(item, event)}
                              />
                            </label>

                            <Button
                              variant="light"
                              className="rounded-pill px-3 py-2"
                              onClick={() => handleEdit(item)}
                            >
                              <FaPen className="me-2" />
                              Update
                            </Button>

                            <Button
                              variant="light"
                              className="rounded-pill px-3 py-2 text-danger"
                              onClick={() => handleDeleteTopic(item)}
                            >
                              <FaTrash className="me-2" />
                              Delete Topic
                            </Button>
                          </div>
                        </Col>

                        <Col lg={5}>
                          <VideoPreview
                            url={previewVideo?.video_url || item.video_url}
                            title={item.topic_name}
                          />
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })
            ) : !loading ? (
              <Card className="border-0 rounded-5 shadow-sm">
                <Card.Body className="p-4 text-center text-muted">
                  No topics found. Add a topic for one of your courses.
                </Card.Body>
              </Card>
            ) : null}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherSyllabus;
