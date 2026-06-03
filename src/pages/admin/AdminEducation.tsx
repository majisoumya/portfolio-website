import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";

const AdminEducation = () => {
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchEducation(); }, []);

  const fetchEducation = async () => {
    setLoading(true);
    const { data } = await supabase.from("education").select("*").order("created_at", { ascending: false });
    setEducation(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setDegree(""); setInstitution(""); setPeriod(""); setDescription(""); setFile(null);
    setIsEditing(false); setCurrentId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (item: any) => {
    setDegree(item.degree); setInstitution(item.institution); setPeriod(item.period); setDescription(item.description);
    setCurrentId(item.id); setIsEditing(true); setFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this education entry?")) return;
    await supabase.from("education").delete().eq("id", id);
    fetchEducation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localStorage.getItem("demo_admin")) return alert("Cannot save in demo mode.");

    setSaving(true);
    let logoUrl = null;
    
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `education/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);
        
      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        logoUrl = data.publicUrl;
      } else {
        alert("Failed to upload image: " + uploadError.message);
      }
    }

    const payload: any = { degree, institution, period, description };
    if (logoUrl) payload.logo_url = logoUrl;

    if (isEditing && currentId) {
      await supabase.from("education").update(payload).eq("id", currentId);
    } else {
      const { error } = await supabase.from("education").insert([payload]);
      if (error) alert("Save failed: " + error.message);
    }
    
    setSaving(false);
    resetForm(); fetchEducation();
  };

  const modalContent = isModalOpen ? (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h3>{isEditing ? "Edit Education" : "Add Education"}</h3>
          <button className="btn-close" onClick={resetForm}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
          <input className="admin-input" placeholder="Degree (e.g., B.Tech in CS)" value={degree} onChange={e => setDegree(e.target.value)} required />
          <input className="admin-input" placeholder="Institution" value={institution} onChange={e => setInstitution(e.target.value)} required />
          <input className="admin-input" placeholder="Period (e.g., 2019 - 2023)" value={period} onChange={e => setPeriod(e.target.value)} required />
          <textarea className="admin-input" placeholder="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase'}}>School/College Logo (Optional)</label>
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
        <h2 className="admin-page-title" style={{marginBottom: 0}}>Manage Education</h2>
        <button className="admin-btn-add" onClick={() => setIsModalOpen(true)}>
          + Add Education
        </button>
      </div>
      
      {modalContent && createPortal(modalContent, document.body)}
      
      {loading ? (
        <div>Loading...</div>
      ) : education.length === 0 ? (
        <div style={{color: '#94a3b8'}}>No entries found.</div>
      ) : (
        <div className="admin-grid">
          {education.map(e => (
            <div className="admin-thumbnail-card" key={e.id}>
              {e.logo_url ? (
                <div className="thumbnail-image" style={{background: '#fff'}}>
                  <img src={e.logo_url} alt={e.institution} style={{objectFit: 'contain', padding: '10px'}} />
                </div>
              ) : (
                <div className="thumbnail-image" style={{fontSize: '48px'}}>
                  🎓
                </div>
              )}
              <div className="thumbnail-content">
                <h4>{e.degree}</h4>
                <p style={{fontWeight: 600, color: '#00d2ff'}}>{e.institution}</p>
                <p style={{marginTop: '4px'}}>{e.period}</p>
                <p style={{marginTop: '8px', fontStyle: 'italic'}}>{e.description}</p>
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

export default AdminEducation;
