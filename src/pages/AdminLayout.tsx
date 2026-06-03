import { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FiHome, FiBookOpen, FiBriefcase, FiUser, FiLayout, FiStar, FiAward, FiFileText, FiFolder, FiSettings, FiLogOut, FiExternalLink, FiClock, FiSun, FiMoon } from "react-icons/fi";
import "../components/styles/Admin.css";

// Admin Sub-components
import AdminHome from "./admin/AdminHome";
import AdminProjects from "./admin/AdminProjects";
import AdminEducation from "./admin/AdminEducation";
import AdminExperience from "./admin/AdminExperience";
import AdminAbout from "./admin/AdminAbout";
import AdminSkills from "./admin/AdminSkills";
import AdminCertifications from "./admin/AdminCertifications";
import AdminResume from "./admin/AdminResume";
import AdminLibrary from "./admin/AdminLibrary";
import AdminSettings from "./admin/AdminSettings";
import AdminContent from "./admin/AdminContent";

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const savedMode = localStorage.getItem("admin_light_mode");
    if (savedMode === "true") setIsLightMode(true);
  }, []);

  const toggleLightMode = () => {
    setIsLightMode(!isLightMode);
    localStorage.setItem("admin_light_mode", (!isLightMode).toString());
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Demo mode check
      if (localStorage.getItem("demo_admin") === "true") {
        setIsGuest(true);
        setLoading(false);
        return;
      }
      
      const response = await supabase.auth.getSession();
      const session = response.data?.session;
      if (!session) {
        console.warn("User is not logged in, but allowing access per request.");
        setIsGuest(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (localStorage.getItem("demo_admin") === "true") {
      localStorage.removeItem("demo_admin");
      navigate("/login");
      return;
    }
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) return <div className="admin-loading">Loading Admin Portal...</div>;

  const tabs = [
    { name: "Home", path: "/admin/home", icon: FiHome },
    { name: "Education", path: "/admin/education", icon: FiBookOpen },
    { name: "Experience", path: "/admin/experience", icon: FiBriefcase },
    { name: "About", path: "/admin/about", icon: FiUser },
    { name: "Projects", path: "/admin/projects", icon: FiLayout },
    { name: "Skills", path: "/admin/skills", icon: FiStar },
    { name: "Certifications", path: "/admin/certifications", icon: FiAward },
    { name: "Resume", path: "/admin/resume", icon: FiFileText },
    { name: "Library", path: "/admin/library", icon: FiFolder },
    { name: "Settings", path: "/admin/settings", icon: FiSettings },
  ];

  const currentPath = location.pathname === "/admin" ? "/admin/home" : location.pathname;

  return (
    <div className={`admin-dashboard ${isLightMode ? 'light-mode' : ''}`}>
      <div className="admin-dashboard-bg-blob1"></div>
      <div className="admin-dashboard-bg-blob2"></div>

      {isGuest && (
        <div className="admin-guest-banner">
          ⚠️ Demo Mode: You are viewing without saving permissions. <Link to="/login">Log In</Link>!
        </div>
      )}

      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-box">A</div>
          <span className="admin-sidebar-title">Admin</span>
        </div>

        <div className="admin-nav-links">
          {tabs.map(tab => (
            <Link 
              key={tab.name} 
              to={tab.path} 
              className={`admin-nav-item ${currentPath.includes(tab.path) ? "active" : ""}`}
            >
              <tab.icon className="nav-icon" />
              <span className="nav-label">{tab.name}</span>
            </Link>
          ))}
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-time-box">
            <FiClock className="nav-icon" />
            <span className="nav-label">{currentTime}</span>
          </div>
          <button className="admin-nav-item" onClick={toggleLightMode}>
            {isLightMode ? <FiMoon className="nav-icon" /> : <FiSun className="nav-icon" />}
            <span className="nav-label">{isLightMode ? "Dark Mode" : "Light Mode"}</span>
          </button>
          <Link to="/" className="admin-nav-item">
            <FiExternalLink className="nav-icon" />
            <span className="nav-label">View Site</span>
          </Link>
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </div>
      
      <div className="admin-main">
        <div className="admin-content-window">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="education" element={<AdminEducation />} />
            <Route path="experience" element={<AdminExperience />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="certifications" element={<AdminCertifications />} />
            <Route path="resume" element={<AdminResume />} />
            <Route path="library" element={<AdminLibrary />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
