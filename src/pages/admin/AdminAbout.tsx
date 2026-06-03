import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AdminAbout = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({ about_title: "", about_desc: "" });

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase.from("settings").select("*");
      if (data) {
        const newContent = { ...content };
        data.forEach((item: any) => {
          if (item.key === 'about_title' || item.key === 'about_desc') {
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
    alert("About section saved.");
  };

  if (loading) return <div style={{padding: '40px'}}>Loading...</div>;

  return (
    <div className="admin-page-container">
      <h2 className="admin-page-title">About Management</h2>
      <div className="admin-form-grid">
        <div className="form-group full-width">
          <label>Title</label>
          <input className="admin-input" value={content.about_title} onChange={e => handleChange('about_title', e.target.value)} />
        </div>
        <div className="form-group full-width">
          <label>Description</label>
          <textarea className="admin-input" value={content.about_desc} onChange={e => handleChange('about_desc', e.target.value)} style={{height: '200px'}} />
        </div>
      </div>
      <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save About Settings"}</button>
    </div>
  );
};

export default AdminAbout;
