import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AdminHome = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbErrorMsg, setDbErrorMsg] = useState<string | null>(null);

  // Content State mapped to the Home Page fields in the design
  const [content, setContent] = useState({
    home_greeting: "",
    home_location: "",
    home_roles: "",
    home_roles_speed: "",
    home_desc_1: "",
    home_desc_2: ""
  });

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from("settings").select("*");
      
      if (error) {
        setDbErrorMsg(`Failed to fetch: ${error.message}`);
      } else if (data) {
        const newContent = { ...content };
        data.forEach((item: any) => {
          if (item.key in newContent) {
            (newContent as any)[item.key] = item.value;
          }
        });
        setContent(newContent);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleChange = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (localStorage.getItem("demo_admin")) return alert("Cannot save in demo mode.");
    
    setSaving(true);
    let hasError = false;

    // Save each key iteratively
    for (const [key, value] of Object.entries(content)) {
      const { error: updateError } = await supabase
        .from("settings")
        .update({ value })
        .eq('key', key);
        
      if (updateError) {
        // Fallback: insert if not exists (upsert logic since we didn't specify UPSERT correctly before if key is missing)
        const { error: insertError } = await supabase
            .from("settings")
            .upsert({ key, value }, { onConflict: 'key' });
        
        if (insertError) {
            hasError = true;
            console.error(`Failed to save ${key}:`, insertError);
        }
      }
    }

    setSaving(false);
    if (hasError) {
      alert("Some fields failed to save. Check console for details.");
    } else {
      alert("Home settings updated successfully!");
    }
  };

  if (loading) return <div style={{padding: '40px', color: '#5f6368'}}>Loading home settings...</div>;

  return (
    <div className="admin-page-container">
      <h2 className="admin-page-title">Home Page Management</h2>

      {dbErrorMsg && (
        <div style={{background: '#fce8e6', color: '#d93025', padding: '12px', borderRadius: '4px', marginBottom: '20px'}}>
          <strong>Error:</strong> {dbErrorMsg}
        </div>
      )}

      <div className="admin-form-grid">
        <div className="form-group">
          <label>Greeting Text</label>
          <input 
            type="text" 
            className="admin-input" 
            value={content.home_greeting} 
            onChange={e => handleChange('home_greeting', e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Location Text</label>
          <input 
            type="text" 
            className="admin-input" 
            value={content.home_location} 
            onChange={e => handleChange('home_location', e.target.value)} 
          />
        </div>

        <div className="form-group" style={{gridColumn: '1 / 2'}}>
          <label>Typewriter Roles (Comma separated)</label>
          <input 
            type="text" 
            className="admin-input" 
            value={content.home_roles} 
            onChange={e => handleChange('home_roles', e.target.value)} 
          />
          <div className="admin-input-hint">These will animate sequentially on the home page.</div>
        </div>

        <div className="form-group" style={{gridColumn: '2 / 3'}}>
          <label>Speed (ms)</label>
          <input 
            type="text" 
            className="admin-input" 
            value={content.home_roles_speed} 
            onChange={e => handleChange('home_roles_speed', e.target.value)} 
          />
          <div className="admin-input-hint">Delay before role transition.</div>
        </div>

        <div className="form-group full-width">
          <label>Home Description 1</label>
          <textarea 
            className="admin-input" 
            value={content.home_desc_1} 
            onChange={e => handleChange('home_desc_1', e.target.value)} 
          />
        </div>

        <div className="form-group full-width">
          <label>Home Description 2</label>
          <textarea 
            className="admin-input" 
            value={content.home_desc_2} 
            onChange={e => handleChange('home_desc_2', e.target.value)} 
          />
        </div>
      </div>

      <button 
        className="admin-btn-primary" 
        onClick={handleSave} 
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Home Settings"}
      </button>

    </div>
  );
};

export default AdminHome;
