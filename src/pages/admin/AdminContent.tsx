import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AdminContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbErrorMsg, setDbErrorMsg] = useState<string | null>(null);

  // Content State
  const [content, setContent] = useState({
    hero_greeting: "",
    hero_firstname: "",
    hero_lastname: "",
    hero_role_title: "",
    hero_role_1: "",
    hero_role_2: "",
    about_title: "",
    about_desc: "",
    contact_email: "",
    contact_edu: "",
    footer_name: "",
    social_github: "",
    social_linkedin: "",
    social_twitter: "",
    social_instagram: ""
  });

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from("settings").select("*");
      
      if (error) {
        if (error.code === '42P01') {
          setDbErrorMsg("The 'settings' table is missing. Please run the SQL command from schema.sql.");
        } else {
          setDbErrorMsg(`Failed to fetch: ${error.message}`);
        }
      } else if (data) {
        const newContent = { ...content };
        let hasContent = false;
        data.forEach(item => {
          if (item.key in newContent) {
            (newContent as any)[item.key] = item.value;
            hasContent = true;
          }
        });
        if (!hasContent) {
          setDbErrorMsg("The database table exists but is missing the default content rows. Please run the updated schema.sql INSERT commands.");
        } else {
          setDbErrorMsg(null);
        }
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

    // Save each key iteratively to avoid constraint issues
    for (const [key, value] of Object.entries(content)) {
      const { error: updateError } = await supabase
        .from("settings")
        .update({ value })
        .eq('key', key);
        
      if (updateError) {
        hasError = true;
        console.error(`Failed to save ${key}:`, updateError);
      }
    }

    setSaving(false);
    if (hasError) {
      alert("Some fields failed to save. Check console for details.");
    } else {
      alert("Site content updated successfully! Check your main site.");
    }
  };

  if (loading) return <div style={{padding: '40px', color: '#5f6368'}}>Loading content settings...</div>;

  return (
    <div className="admin-section" style={{animation: 'fadeInUp 0.6s ease forwards'}}>
      <div className="admin-header">
        <h2>Site Content Management</h2>
      </div>

      {dbErrorMsg && (
        <div className="admin-error" style={{marginBottom: '20px'}}>
          <strong>Database Error:</strong> {dbErrorMsg}
        </div>
      )}

      <div className="admin-card" style={{animationDelay: '0.1s'}}>
        <h3 style={{color: '#4285f4'}}>Landing Page (Hero Section)</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div className="form-group">
            <label>Greeting</label>
            <input type="text" className="admin-input" value={content.hero_greeting} onChange={e => handleChange('hero_greeting', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Role Title</label>
            <input type="text" className="admin-input" value={content.hero_role_title} onChange={e => handleChange('hero_role_title', e.target.value)} />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" className="admin-input" value={content.hero_firstname} onChange={e => handleChange('hero_firstname', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" className="admin-input" value={content.hero_lastname} onChange={e => handleChange('hero_lastname', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Animated Role 1</label>
            <input type="text" className="admin-input" value={content.hero_role_1} onChange={e => handleChange('hero_role_1', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Animated Role 2</label>
            <input type="text" className="admin-input" value={content.hero_role_2} onChange={e => handleChange('hero_role_2', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-card" style={{animationDelay: '0.2s'}}>
        <h3 style={{color: '#34a853'}}>About Section</h3>
        <div className="form-group">
          <label>Title</label>
          <input type="text" className="admin-input" value={content.about_title} onChange={e => handleChange('about_title', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea className="admin-input" rows={5} value={content.about_desc} onChange={e => handleChange('about_desc', e.target.value)} style={{resize: 'vertical'}} />
        </div>
      </div>

      <div className="admin-card" style={{animationDelay: '0.3s'}}>
        <h3 style={{color: '#fbbc05'}}>Contact & Footer Information</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="text" className="admin-input" value={content.contact_email} onChange={e => handleChange('contact_email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Education Subtitle</label>
            <input type="text" className="admin-input" value={content.contact_edu} onChange={e => handleChange('contact_edu', e.target.value)} />
          </div>
          <div className="form-group" style={{gridColumn: '1 / -1'}}>
            <label>Footer Name</label>
            <input type="text" className="admin-input" value={content.footer_name} onChange={e => handleChange('footer_name', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admin-card" style={{animationDelay: '0.4s'}}>
        <h3 style={{color: '#ea4335'}}>Social Links</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div className="form-group">
            <label>Github URL</label>
            <input type="text" className="admin-input" value={content.social_github} onChange={e => handleChange('social_github', e.target.value)} />
          </div>
          <div className="form-group">
            <label>LinkedIn URL</label>
            <input type="text" className="admin-input" value={content.social_linkedin} onChange={e => handleChange('social_linkedin', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Twitter (X) URL</label>
            <input type="text" className="admin-input" value={content.social_twitter} onChange={e => handleChange('social_twitter', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Instagram URL</label>
            <input type="text" className="admin-input" value={content.social_instagram} onChange={e => handleChange('social_instagram', e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{position: 'sticky', bottom: '20px', display: 'flex', justifyContent: 'flex-end', animation: 'fadeInUp 0.8s ease forwards', zIndex: 100}}>
        <button 
          className="admin-btn-primary" 
          onClick={handleSave} 
          disabled={saving}
          style={{padding: '15px 40px', fontSize: '18px', boxShadow: '0 10px 30px rgba(66, 133, 244, 0.4)', width: 'auto'}}
        >
          {saving ? "Saving Changes..." : "Save All Content"}
        </button>
      </div>

    </div>
  );
};

export default AdminContent;
