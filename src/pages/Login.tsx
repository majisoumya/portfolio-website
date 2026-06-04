import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { gsap } from "gsap";
import "../components/styles/Admin.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then((response: any) => {
      const session = response.data?.session;
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Futuristic entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
      
      gsap.fromTo(
        ".login-stagger",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.5 }
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Incase Supabase keys aren't set, allow dummy login for preview
    if (!import.meta.env.VITE_SUPABASE_URL) {
      alert("No Supabase Keys detected. Logging in via Demo Mode.");
      localStorage.setItem("demo_admin", "true");
      navigate("/admin");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/admin");
    }
    
    setLoading(false);
  };

  return (
    <div className="admin-login-container" ref={containerRef}>
      {/* Animated background particles */}
      <div className="login-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="login-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      <div className="admin-login-card" ref={cardRef}>
        <div className="login-glow"></div>
        <h2 className="login-stagger">SYSTEM LOGIN</h2>
        <p className="login-stagger">Authenticate to access the mainframe</p>
        
        {error && <div className="admin-error login-stagger">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group login-stagger">
            <label>ACCESS ID (EMAIL)</label>
            <input 
              className="admin-input futuristic-input"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Enter your access ID"
            />
          </div>
          <div className="form-group login-stagger">
            <label>SECURITY KEY (PASSWORD)</label>
            <input 
              className="admin-input futuristic-input"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Enter your security key"
            />
          </div>
          <button type="submit" disabled={loading} className="admin-btn-primary futuristic-btn login-stagger">
            {loading ? "AUTHENTICATING..." : "INITIALIZE LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
