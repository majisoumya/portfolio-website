import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";

const AdminExperience = () => {
  const [experience, setExperience] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    setLoading(true);
    const { data } = await supabase.from("experience").select("*").order("created_at", { ascending: false });
    setExperience(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setRole(""); setCompany(""); setPeriod(""); setDescription(""); setFile(null);
    setIsEditing(false); setCurrentId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (item: any) => {
    setRole(item.role); setCompany(item.company); setPeriod(item.period); setDescription(item.description);
    setCurrentId(item.id); setIsEditing(true); setFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this experience entry?")) return;
    await supabase.from("experience").delete().eq("id", id);
    fetchExperience();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localStorage.getItem("demo_admin")) return alert("Cannot save in demo mode.");

    setSaving(true);
    let logoUrl = null;
    
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `experience/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);
        
      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        logoUrl = data.publicUrl;
      } else {
        alert("Failed to upload logo: " + uploadError.message);
      }
    }

    const payload: any = { role, company, period, description };
    if (logoUrl) payload.logo_url = logoUrl;

    if (isEditing && currentId) {
      const { error } = await supabase.from("experience").update(payload).eq("id", currentId);
      if (error) alert("Update failed: " + error.message);
    } else {
      const { error } = await supabase.from("experience").insert([payload]);
      if (error) alert("Save failed. Did you run the SQL script to create the experience table? Error: " + error.message);
    }
    
    setSaving(false);
    resetForm(); fetchExperience();
  };

  const modalContent = isModalOpen ? (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h3>{isEditing ? "Edit Experience" : "Add Experience"}</h3>
          <button className="btn-close" onClick={resetForm}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
          <input className="admin-input" placeholder="Role (e.g., Software Engineer)" value={role} onChange={e => setRole(e.target.value)} required />
          <input className="admin-input" placeholder="Company Name" value={company} onChange={e => setCompany(e.target.value)} required />
          <input className="admin-input" placeholder="Period (e.g., 2021 - Present)" value={period} onChange={e => setPeriod(e.target.value)} required />
          <textarea className="admin-input" placeholder="Description of your responsibilities..." rows={4} value={description} onChange={e => setDescription(e.target.value)} />
          
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase'}}>Company Logo (Optional)</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{color: '#fff'}} />
          </div>

          <div style={{display: "flex", gap: "10px", marginTop: "10px"}}>
            <button type="submit" disabled={saving} className="admin-btn-primary" style={{flex: 1}}>
              {saving ? "Saving..." : (isEditing ? "Update" : "Save")}
            </button>
            {isEditing && <button type="button" onClick={resetForm} className="btn-delete" style={{background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "transparent"}}>Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div className="admin-page-container">
      <div className="admin-list-header">
        <h2 className="admin-page-title" style={{marginBottom: 0}}>Manage Experience</h2>
        <button className="admin-btn-add" onClick={() => setIsModalOpen(true)}>
          + Add Experience
        </button>
      </div>
      
      {modalContent && createPortal(modalContent, document.body)}
      
      {loading ? (
        <div>Loading...</div>
      ) : experience.length === 0 ? (
        <div style={{color: '#94a3b8'}}>No experience entries found. Add one above!</div>
      ) : (
        <div className="admin-grid">
          {experience.map(e => (
            <div className="admin-thumbnail-card" key={e.id}>
              {e.logo_url ? (
                <div className="thumbnail-image" style={{background: '#fff'}}>
                  <img src={e.logo_url} alt={e.company} style={{objectFit: 'contain', padding: '10px'}} />
                </div>
              ) : (
                <div className="thumbnail-image" style={{fontSize: '48px'}}>
                  💼
                </div>
              )}
              <div className="thumbnail-content">
                <h4>{e.role}</h4>
                <p style={{fontWeight: 600, color: '#00d2ff'}}>{e.company}</p>
                <p style={{marginTop: '4px'}}>{e.period}</p>
                <p style={{marginTop: '8px', fontStyle: 'italic', fontSize: '13px'}}>{e.description}</p>
              </div>
              <div className="thumbnail-actions">
                <button className="btn-edit" onClick={() => handleEdit(e)} style={{flex: 1}}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(e.id)} style={{flex: 1}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminExperience;
