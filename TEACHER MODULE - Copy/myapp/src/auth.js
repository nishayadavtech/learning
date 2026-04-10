const TOKEN_KEYS = ["token", "teacherToken"];
const USER_KEYS = ["authUser", "teacher"];

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return "";
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  for (const key of USER_KEYS) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    const parsed = safeJsonParse(value);
    if (parsed) return parsed;
  }

  return null;
};

export const getUserRole = (user = getStoredUser()) => {
  const rawRole =
    user?.role ||
    user?.userType ||
    user?.user_type ||
    user?.type ||
    user?.module;

  const normalizedRole = String(rawRole || "teacher").toLowerCase();
  return ["admin", "student", "teacher"].includes(normalizedRole)
    ? normalizedRole
    : "teacher";
};

export const saveAuthSession = ({ token, user }) => {
  if (typeof window === "undefined") return;

  if (token) {
    TOKEN_KEYS.forEach((key) => localStorage.setItem(key, token));
  }

  if (user) {
    const serializedUser = JSON.stringify(user);
    USER_KEYS.forEach((key) => localStorage.setItem(key, serializedUser));
  }
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  [...TOKEN_KEYS, ...USER_KEYS].forEach((key) => localStorage.removeItem(key));
};
