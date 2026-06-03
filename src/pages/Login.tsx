import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../components/styles/Admin.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then((response: any) => {
      const session = response.data?.session;
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

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
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Portal</h2>
        <p>Sign in to manage your portfolio</p>
        
        {error && <div className="admin-error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              className="admin-input"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              className="admin-input"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="admin-btn-primary">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
