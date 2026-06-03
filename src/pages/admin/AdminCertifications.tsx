import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";

const AdminCertifications = () => {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchCertifications(); }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    const { data } = await supabase.from("certifications").select("*").order("created_at", { ascending: false });
    setCertifications(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle(""); setIssuer(""); setDate(""); setDescription(""); setFile(null);
    setIsEditing(false); setCurrentId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (item: any) => {
    setTitle(item.title); setIssuer(item.issuer); setDate(item.date); setDescription(item.description || "");
    setCurrentId(item.id); setIsEditing(true); setFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this certification?")) return;
    await supabase.from("certifications").delete().eq("id", id);
    fetchCertifications();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localStorage.getItem("demo_admin")) return alert("Cannot save in demo mode.");

    setSaving(true);
    let imageUrl = null;
    
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `certifications/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);
        
      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      } else {
        alert("Failed to upload image: " + uploadError.message);
      }
    }

    const payload: any = { title, issuer, date, description };
    if (imageUrl) payload.image_url = imageUrl;

    if (isEditing && currentId) {
      const { error } = await supabase.from("certifications").update(payload).eq("id", currentId);
      if (error) alert("Update failed: " + error.message);
    } else {
      const { error } = await supabase.from("certifications").insert([payload]);
      if (error) alert("Save failed. Did you run the SQL script? Error: " + error.message);
    }
    
    setSaving(false);
    resetForm(); fetchCertifications();
  };

  const modalContent = isModalOpen ? (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h3>{isEditing ? "Edit Certification" : "Add Certification"}</h3>
          <button className="btn-close" onClick={resetForm}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
          <input className="admin-input" placeholder="Certification Title (e.g. AWS Cloud Practitioner)" value={title} onChange={e => setTitle(e.target.value)} required />
          <input className="admin-input" placeholder="Issuer (e.g. Amazon Web Services)" value={issuer} onChange={e => setIssuer(e.target.value)} required />
          <input className="admin-input" placeholder="Date/Year (e.g. Sept 2023)" value={date} onChange={e => setDate(e.target.value)} required />
          <textarea className="admin-input" placeholder="Short description..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          
          <div>
            <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase'}}>Certificate Image</label>
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
        <h2 className="admin-page-title" style={{marginBottom: 0}}>Manage Certifications</h2>
        <button className="admin-btn-add" onClick={() => setIsModalOpen(true)}>
          + Add Certification
        </button>
      </div>
      
      {modalContent && createPortal(modalContent, document.body)}
      
      {loading ? (
        <div>Loading...</div>
      ) : certifications.length === 0 ? (
        <div style={{color: '#94a3b8'}}>No certifications added yet.</div>
      ) : (
        <div className="admin-grid">
          {certifications.map(cert => (
            <div className="admin-thumbnail-card" key={cert.id}>
              {cert.image_url ? (
                <div className="thumbnail-image" style={{background: '#fff'}}>
                  <img src={cert.image_url} alt={cert.title} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                </div>
              ) : (
                <div className="thumbnail-image" style={{fontSize: '48px'}}>
                  🎓
                </div>
              )}
              <div className="thumbnail-content">
                <h4>{cert.title}</h4>
                <p style={{fontWeight: 600, color: '#00d2ff'}}>{cert.issuer}</p>
                <p style={{marginTop: '4px'}}>{cert.date}</p>
              </div>
              <div className="thumbnail-actions">
                <button className="btn-edit" onClick={() => handleEdit(cert)} style={{flex: 1}}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(cert.id)} style={{flex: 1}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCertifications;
