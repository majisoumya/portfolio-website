import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AdminResume = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({ resume_url: "" });

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from("settings").select("*");
      if (data) {
        const newContent = { ...content };
        data.forEach((item: any) => {
          if (item.key === 'resume_url') {
            (newContent as any)[item.key] = item.value;
          }
        });
        setContent(newContent);
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleChange = (key: string, value: string) => setContent(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (localStorage.getItem("demo_admin")) return alert("Cannot save in demo mode.");
    setSaving(true);
    for (const [key, value] of Object.entries(content)) {
      await supabase.from("settings").upsert({ key, value }, { onConflict: 'key' });
    }
    setSaving(false);
    alert("Resume link saved.");
  };

  if (loading) return <div style={{padding: '40px'}}>Loading...</div>;

  return (
    <div className="admin-page-container">
      <h2 className="admin-page-title">Resume Management</h2>
      <div className="admin-form-grid">
        <div className="form-group full-width">
          <label>Resume Download URL / Drive Link</label>
          <input className="admin-input" value={content.resume_url} onChange={e => handleChange('resume_url', e.target.value)} />
          <div className="admin-input-hint">Provide a direct link to your PDF resume (e.g., Google Drive link).</div>
        </div>
      </div>
      <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Resume Settings"}</button>
    </div>
  );
};

export default AdminResume;
