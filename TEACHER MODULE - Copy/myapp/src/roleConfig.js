import { getUserRole } from "./auth";

const roleConfig = {
  admin: {
    label: "Admin",
    dashboardTitle: "Admin Dashboard",
    moduleTitle: "Admin Panel",
    canManageCourses: true,
    canManageSyllabus: true,
    sidebarLinks: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/dashboard/course", label: "Courses" },
      { to: "/dashboard/syllabus", label: "Syllabus" },
    ],
  },
  teacher: {
    label: "Teacher",
    dashboardTitle: "Teacher Dashboard",
    moduleTitle: "Teacher Module",
    canManageCourses: true,
    canManageSyllabus: true,
    sidebarLinks: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/dashboard/course", label: "Courses" },
      { to: "/dashboard/syllabus", label: "Syllabus" },
    ],
  },
  student: {
    label: "Student",
    dashboardTitle: "Student Dashboard",
    moduleTitle: "Student Module",
    canManageCourses: false,
    canManageSyllabus: false,
    sidebarLinks: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/dashboard/course", label: "My Courses" },
      { to: "/dashboard/syllabus", label: "Learning Plan" },
    ],
  },
};

export const getRoleConfig = (user) =>
  roleConfig[getUserRole(user)] || roleConfig.teacher;
