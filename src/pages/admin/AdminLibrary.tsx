import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../lib/supabase";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure PDF.js worker natively using Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const AdminLibrary = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState("Notes");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<Blob | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.item_type && item.item_type.toLowerCase().includes(query))
    );
  });

  useEffect(() => { fetchLibrary(); }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    const { data } = await supabase.from("library").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this file?")) return;

    // Remove files from storage
    const item = items.find(i => i.id === id);
    if (item) {
      const pathsToDelete = [];
      if (item.file_url) {
        const path = item.file_url.split('/portfolio-assets/')[1];
        if (path) pathsToDelete.push(path);
      }
      if (item.image_url) {
        const path = item.image_url.split('/portfolio-assets/')[1];
        if (path) pathsToDelete.push(path);
      }
      if (pathsToDelete.length > 0) {
        await supabase.storage.from('portfolio-assets').remove(pathsToDelete);
      }
    }

    await supabase.from("library").delete().eq("id", id);
    fetchLibrary();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setImageFile(null); // Reset old thumbnail

    if (selectedFile && selectedFile.type === "application/pdf") {
      try {
        setGeneratingThumbnail(true);
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (!context) throw new Error("Could not get canvas context");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport } as any).promise;
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) setImageFile(blob);
          setGeneratingThumbnail(false);
        }, "image/png");
      } catch (err) {
        console.error("Failed to generate PDF thumbnail:", err);
        setGeneratingThumbnail(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localStorage.getItem("demo_admin")) return alert("Cannot save in demo mode.");
    if (!file) return alert("Please select a PDF file.");

    setUploading(true);
    setUploadProgress(0);
    
    // Upload PDF File
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `library/${fileName}`;
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseAnonKey;
      
      const uploadUrl = `${supabaseUrl}/storage/v1/object/portfolio-assets/${filePath}`;
      
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('apikey', supabaseAnonKey);
        xhr.setRequestHeader('Content-Type', file.type || 'application/pdf');
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errorMsg = xhr.statusText;
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.message) errorMsg = res.message;
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        };
        
        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.send(file);
      });
    } catch (uploadError: any) {
      alert("Failed to upload PDF: " + uploadError.message + "\\n(Did you log in?)");
      setUploading(false);
      return;
    }

    const { data: fileData } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
    const fileUrl = fileData.publicUrl;

    // Upload Cover Image (Generated)
    let imageUrl = null;
    if (imageFile) {
      const imgPath = `library/covers/${Math.random()}.png`;
      const { error: imgError } = await supabase.storage
        .from('portfolio-assets')
        .upload(imgPath, imageFile, { contentType: 'image/png' });
        
      if (!imgError) {
        const { data: imgData } = supabase.storage.from('portfolio-assets').getPublicUrl(imgPath);
        imageUrl = imgData.publicUrl;
      }
    }

    const { error: dbError } = await supabase.from("library").insert([{ 
      title, 
      item_type: itemType, 
      description, 
      file_url: fileUrl,
      image_url: imageUrl
    }]);

    if (dbError) {
      console.error(dbError);
      alert("Database Insert Failed: " + dbError.message + "\n\nDid you run the SQL command to add image_url column?");
      setUploading(false);
      return;
    }
    
    setTitle(""); setDescription(""); setFile(null); setImageFile(null);
    setUploading(false);
    setIsModalOpen(false);
    fetchLibrary();
  };

  return (
    <div className="admin-page-container">
      <div className="admin-list-header" style={{flexDirection: 'column', alignItems: 'stretch', gap: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 className="admin-page-title" style={{marginBottom: 0}}>Manage Library</h2>
          <button className="admin-btn-add" onClick={() => setIsModalOpen(true)}>
            + Add File
          </button>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <input 
            type="text" 
            className="admin-input" 
            placeholder="Search by book name, type, or keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '100%' }}
          />
        </div>
      </div>

      {isModalOpen && createPortal(
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>Upload New File</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "15px"}}>
              <div style={{display: "flex", gap: "15px"}}>
                <input className="admin-input" style={{flex: 2}} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <select className="admin-input" style={{flex: 1}} value={itemType} onChange={e => setItemType(e.target.value)}>
                  <option value="Notes">Notes</option>
                  <option value="Book">Book</option>
                </select>
              </div>
              <textarea className="admin-input" placeholder="Description" rows={2} value={description} onChange={e => setDescription(e.target.value)} />

              <div>
                <label style={{display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase'}}>PDF File</label>
                <input type="file" accept=".pdf" onChange={handleFileChange} required style={{color: '#fff'}} />
                {generatingThumbnail && <span style={{fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '4px'}}>Generating cover thumbnail automatically...</span>}
                {imageFile && !generatingThumbnail && <span style={{fontSize: '12px', color: '#00d2ff', display: 'block', marginTop: '4px'}}>✓ Cover generated automatically!</span>}
              </div>
              
              <button 
                type="submit" 
                disabled={uploading || generatingThumbnail} 
                className="admin-btn-primary"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {uploading ? (
                  <>
                    <span style={{ position: 'relative', zIndex: 1 }}>
                      {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Finishing...'}
                    </span>
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        height: '100%', 
                        width: `${uploadProgress}%`, 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        transition: 'width 0.3s ease',
                        zIndex: 0
                      }} 
                    />
                  </>
                ) : (
                  "Upload File"
                )}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
      
      {loading ? (
        <div>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div style={{color: '#5f6368'}}>{items.length === 0 ? "No files uploaded." : "No files found matching your search."}</div>
      ) : (
        <div className="admin-grid">
          {filteredItems.map(item => (
            <div className="admin-thumbnail-card" key={item.id}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="thumbnail-image" style={{objectFit: 'contain', padding: 0, background: '#f8f9fa', height: '160px'}} />
              ) : (
                <div className="thumbnail-image" style={{fontSize: '48px', height: '160px', padding: 0}}>
                  📄
                </div>
              )}
              <div className="thumbnail-content">
                <h4>{item.title}</h4>
                <p>{item.item_type}</p>
                <p style={{marginTop: '8px', fontStyle: 'italic'}}>{item.description}</p>
              </div>
              <div className="thumbnail-actions">
                <a href={item.file_url} target="_blank" rel="noreferrer" className="btn-edit" style={{textDecoration: 'none', textAlign: 'center', flex: 1}}>View PDF</a>
                <button className="btn-delete" onClick={() => handleDelete(item.id)} style={{flex: 1}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLibrary;
