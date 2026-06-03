import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const AdminSettings = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentResume, setCurrentResume] = useState<string | null>(null);

  const [dbErrorMsg, setDbErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      const { data, error } = await supabase.from("settings").select("value").eq("key", "resume_url").single();
      if (error) {
        if (error.code === 'PGRST116') {
          // No row found, which is fine. Just default to #
          setCurrentResume('#');
        } else if (error.code === '42P01') {
          setDbErrorMsg("The 'settings' table is missing. Please create it.");
        } else {
          setDbErrorMsg(`Fetch Error: ${error.message} (${error.code})`);
        }
      } else if (data) {
        setCurrentResume(data.value);
      }
    };
    fetchResume();
  }, []);

  const handleUpload = async () => {
    if (localStorage.getItem("demo_admin")) return alert("Cannot upload in demo mode.");
    if (!file) return alert("Please select a PDF file.");

    setUploading(true);
    const fileName = `resume_${Date.now()}.pdf`;
    const filePath = `resume/${fileName}`;
    
    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file);
      
    if (uploadError) {
      alert("Upload failed.");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
    const fileUrl = data.publicUrl;

    // Try updating first
    const { error: updateError } = await supabase.from("settings")
      .update({ value: fileUrl })
      .eq('key', 'resume_url');
      
    let dbError = updateError;
    
    // If update didn't work (row doesn't exist), insert it
    if (!updateError && currentResume === '#') {
       const { error: insertError } = await supabase.from("settings").insert({ key: 'resume_url', value: fileUrl });
       dbError = insertError;
    }

    if (dbError) {
      console.error(dbError);
      alert("Failed to save to database: " + dbError.message);
      setUploading(false);
      return;
    }
    
    // Delete the old resume from storage to save space
    if (currentResume && currentResume !== "#") {
      try {
        const oldPath = currentResume.split('/portfolio-assets/')[1];
        if (oldPath) {
          await supabase.storage.from('portfolio-assets').remove([oldPath]);
        }
      } catch (e) {
        console.error("Failed to delete old resume", e);
      }
    }
    
    setCurrentResume(fileUrl);
    setFile(null);
    setUploading(false);
    alert("Resume updated successfully!");
  };

  return (
    <div className="admin-section">
      <div className="admin-header"><h2>Site Settings & Resume</h2></div>
      
      <div className="admin-card">
        <h3 style={{marginTop: 0, marginBottom: '15px'}}>Update Master Resume</h3>
        <p style={{color: '#adacac', marginBottom: '20px', fontSize: '14px'}}>
          Upload a new PDF to update the master resume link across your portfolio (e.g. the link in the sidebar).
        </p>

        {dbErrorMsg && (
          <div className="admin-error">
            <strong>Database Error:</strong> {dbErrorMsg}
          </div>
        )}
        
        {currentResume && currentResume !== "#" && (
          <div style={{marginBottom: "20px", background: "rgba(66, 133, 244, 0.05)", padding: "15px", borderRadius: "8px", border: '1px solid rgba(66, 133, 244, 0.2)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <p style={{margin: 0, color: "#1a73e8", fontWeight: 500}}>
                Current Master Resume Preview:
              </p>
              <a href={currentResume} target="_blank" rel="noreferrer" style={{color: "#1a73e8", fontSize: '13px', textDecoration: 'none'}}>Open in new tab ↗</a>
            </div>
            <iframe 
              src={currentResume} 
              width="100%" 
              height="600px" 
              style={{ border: '1px solid #dadce0', borderRadius: '6px', background: 'white' }}
              title="Resume Preview"
            />
          </div>
        )}

        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} style={{
            background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: 'white'
          }} />
          <button className="admin-btn-primary" onClick={handleUpload} disabled={uploading || !file} style={{width: 'auto'}}>
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
