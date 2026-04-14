const TEACHER_PROFILE_PREFIX = "teacherProfile_";
const TEACHER_TOPIC_PREFIX = "teacherTopics_";
const GLOBAL_TOPIC_KEY = "teacherTopics"; // 🔥 backup key

const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const getTeacherId = () => {
  const teacherId = localStorage.getItem("teacherId");
  if (teacherId) {
    return String(teacherId);
  }

  const storedProfile = parseJson(localStorage.getItem("teacherProfile"), null);
  return (
    storedProfile?.id ||
    storedProfile?.teacher_id ||
    storedProfile?.teacherId ||
    storedProfile?.user_id ||
    "default"
  ).toString();
};

export const getTeacherStorageKey = (prefix) => `${prefix}${getTeacherId()}`;

export const getTeacherProfile = () => {
  const scopedProfile = parseJson(
    localStorage.getItem(getTeacherStorageKey(TEACHER_PROFILE_PREFIX)),
    null
  );

  if (scopedProfile) {
    return normalizeTeacherProfile(scopedProfile);
  }

  return normalizeTeacherProfile(
    parseJson(localStorage.getItem("teacherProfile"), null)
  );
};

export const normalizeTeacherProfile = (profile) => {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const id =
    profile.id ??
    profile.teacher_id ??
    profile.teacherId ??
    profile.user_id ??
    localStorage.getItem("teacherId") ??
    "";

  return {
    ...profile,
    id: id ? String(id) : "",
    teacher_id: profile.teacher_id ?? id ?? "",
    name:
      profile.name ||
      profile.teacher_name ||
      profile.full_name ||
      profile.username ||
      "",
    email: profile.email || profile.mail || "",
    phone: profile.phone || profile.mobile || "",
    qualification: profile.qualification || profile.degree || "",
    specialization: profile.specialization || profile.subject || "",
    bio: profile.bio || profile.about || profile.description || "",
  };
};

export const saveTeacherProfile = (profile) => {
  if (!profile || typeof profile !== "object") return;

  const currentProfile = getTeacherProfile() || {};
  const mergedProfile = normalizeTeacherProfile({ ...currentProfile, ...profile });

  if (!mergedProfile) return;

  if (!mergedProfile.id) {
    mergedProfile.id = localStorage.getItem("teacherId") || currentProfile?.id || "";
  }

  if (mergedProfile.id) {
    localStorage.setItem("teacherId", String(mergedProfile.id));
  }

  localStorage.setItem("teacherProfile", JSON.stringify(mergedProfile));
  localStorage.setItem(
    getTeacherStorageKey(TEACHER_PROFILE_PREFIX),
    JSON.stringify(mergedProfile)
  );
};

export const extractTeacherAuthPayload = (payload) => {
  const token =
    payload?.token ||
    payload?.accessToken ||
    payload?.access_token ||
    payload?.jwt ||
    "";

  const teacher =
    payload?.teacher ||
    payload?.user ||
    payload?.profile ||
    payload?.data?.teacher ||
    payload?.data?.user ||
    payload?.data ||
    null;

  return {
    token,
    teacher: normalizeTeacherProfile(teacher),
  };
};

export const clearTeacherSession = () => {
  const teacherId = localStorage.getItem("teacherId");

  localStorage.removeItem("teacherToken");
  localStorage.removeItem("teacherId");
  localStorage.removeItem("teacherProfile");

  if (teacherId) {
    localStorage.removeItem(`${TEACHER_PROFILE_PREFIX}${teacherId}`);

    // 🔥 FIX: topics delete नहीं करेंगे
    // localStorage.removeItem(`${TEACHER_TOPIC_PREFIX}${teacherId}`);
  }
};

export const getLocalTeacherTopics = () => {
  let storedTopics = parseJson(
    localStorage.getItem(getTeacherStorageKey(TEACHER_TOPIC_PREFIX)),
    null
  );

  // 🔥 fallback (logout ke baad bhi data milega)
  if (!storedTopics) {
    storedTopics = parseJson(localStorage.getItem(GLOBAL_TOPIC_KEY), []);
  }

  return Array.isArray(storedTopics) ? storedTopics : [];
};

export const saveLocalTeacherTopics = (topics) => {
  const safeTopics = Array.isArray(topics) ? topics : [];

  // original logic same
  localStorage.setItem(
    getTeacherStorageKey(TEACHER_TOPIC_PREFIX),
    JSON.stringify(safeTopics)
  );

  // 🔥 backup save
  localStorage.setItem(GLOBAL_TOPIC_KEY, JSON.stringify(safeTopics));
};

const normalizeTopicVideo = (video, index = 0) => {
  const name = video?.video_name || video?.name || "";
  const url = video?.video_url || video?.url || "";

  return {
    video_id:
      video?.video_id ||
      video?.id ||
      `video-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    video_name: name,
    video_url: url,
  };
};

const normalizeTopicVideos = (topic) => {
  if (Array.isArray(topic?.videos) && topic.videos.length > 0) {
    return topic.videos
      .map((video, index) => normalizeTopicVideo(video, index))
      .filter((video) => video.video_name || video.video_url);
  }

  if (topic?.video_name || topic?.video_url) {
    return [
      normalizeTopicVideo(
        {
          video_id: topic?.video_id,
          video_name: topic?.video_name,
          video_url: topic?.video_url,
        },
        0
      ),
    ];
  }

  return [];
};

export const normalizeTopic = (topic) => {
  const syllabusId =
    topic?.syllabus_id ??
    topic?.id ??
    topic?.local_id ??
    `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const videos = normalizeTopicVideos(topic);
  const primaryVideo = videos[0] || { video_name: "", video_url: "" };

  return {
    syllabus_id: syllabusId,
    course_id: Number(topic?.course_id) || topic?.course_id || "",
    topic_name: topic?.topic_name || "",
    description: topic?.description || "",
    video_url: primaryVideo.video_url,
    video_name: primaryVideo.video_name,
    videos,
    updated_at: topic?.updated_at || new Date().toISOString(),
    isLocalOnly: Boolean(topic?.isLocalOnly),
    deleted: Boolean(topic?.deleted),
  };
};

export const mergeSyllabusData = (remoteTopics = [], localTopics = []) => {
  const mergedMap = new Map();

  (remoteTopics || []).forEach((topic) => {
    const normalized = normalizeTopic(topic);
    mergedMap.set(String(normalized.syllabus_id), normalized);
  });

  (localTopics || []).forEach((topic) => {
    const normalized = normalizeTopic(topic);

    if (normalized.deleted) {
      mergedMap.delete(String(normalized.syllabus_id));
      return;
    }

    mergedMap.set(String(normalized.syllabus_id), normalized);
  });

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );
};

export const getTeacherStudentCount = (courses = []) =>
  courses.reduce((sum, course) => {
    const count = Number(
      course?.students_count ??
        course?.student_count ??
        course?.total_students ??
        course?.enrolled_students ??
        course?.purchase_count ??
        0
    );

    return sum + (Number.isFinite(count) ? count : 0);
  }, 0);