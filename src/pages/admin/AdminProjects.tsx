import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";

const AdminProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tools, setTools] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle(""); setCategory(""); setTools(""); setDescription(""); setLink(""); setFile(null);
    setIsEditing(false); setCurrentId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (project: any) => {
    setTitle(project.title);
    setCategory(project.category);
    setTools(project.tools);
    setDescription(project.description);
    setLink(project.link);
    setCurrentId(project.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    fetchProjects();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localStorage.getItem("demo_admin")) return alert("Cannot save in demo mode.");

    let imageUrl = null;
    
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `projects/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file);
        
      if (!uploadError) {
        const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    const payload: any = { title, category, tools, description, link };
    if (imageUrl) payload.image_url = imageUrl;

    if (isEditing && currentId) {
      await supabase.from("projects").update(payload).eq("id", currentId);
    } else {
      await supabase.from("projects").insert([payload]);
    }
    
    resetForm();
    fetchProjects();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-list-header">
        <h2 className="admin-page-title" style={{marginBottom: 0}}>Manage Projects</h2>
        <button className="admin-btn-add" onClick={() => setIsModalOpen(true)}>
          + Add Project
        </button>
      </div>
      
      {isModalOpen && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>{isEditing ? "Edit Project" : "Add New Project"}</h3>
              <button className="btn-close" onClick={resetForm}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
              <input className="admin-input" placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} required />
              <input className="admin-input" placeholder="Category (e.g., E-Commerce)" value={category} onChange={e => setCategory(e.target.value)} />
              <input className="admin-input" placeholder="Tools (e.g., React, Node)" value={tools} onChange={e => setTools(e.target.value)} />
              <textarea className="admin-input" placeholder="Description" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
              <input className="admin-input" placeholder="Project Link URL" value={link} onChange={e => setLink(e.target.value)} />
              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase'}}>Project Image</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{color: '#fff'}} />
              </div>
              <div style={{display: "flex", gap: "10px", marginTop: "10px"}}>
                <button type="submit" className="admin-btn-primary" style={{flex: 1}}>{isEditing ? "Update" : "Save"}</button>
                {isEditing && <button type="button" onClick={resetForm} className="btn-delete" style={{background: "rgba(255,255,255,0.1)", color: "#fff", borderColor: "transparent"}}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      
      {loading ? (
        <div>Loading...</div>
      ) : projects.length === 0 ? (
        <div style={{color: '#5f6368'}}>No projects found. Add one above!</div>
      ) : (
        <div className="admin-grid">
          {projects.map(p => (
            <div className="admin-thumbnail-card" key={p.id}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="thumbnail-image" />
              ) : (
                <div className="thumbnail-image" style={{fontSize: '48px'}}>
                  📁
                </div>
              )}
              <div className="thumbnail-content">
                <h4>{p.title}</h4>
                <p>{p.category}</p>
              </div>
              <div className="thumbnail-actions">
                <button className="btn-edit" onClick={() => handleEdit(p)} style={{flex: 1}}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(p.id)} style={{flex: 1}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
