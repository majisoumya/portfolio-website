import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { MdMenuBook, MdDownload } from "react-icons/md";
import "./styles/Education.css"; // Reuse similar styles or add Library specific ones

const Library = () => {
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const { data, error } = await supabase
          .from("library")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setLibraryItems(data || []);
      } catch (err) {
        console.error("Error fetching library:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLibrary();
  }, []);

  if (loading || libraryItems.length === 0) return null;

  return (
    <div className="education-section" id="library">
      <div className="education-container section-container">
        <h2>
          My <span>Library</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {libraryItems.map((item) => (
            <div key={item.id} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              {item.image_url ? (
                <div style={{ height: '160px', width: '100%', background: 'rgba(255,255,255,0.02)', padding: 0 }}>
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ height: '160px', width: '100%', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                   <MdMenuBook size={64} color="rgba(255,255,255,0.2)" />
                </div>
              )}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accentColor)' }}>
                  <MdMenuBook size={20} />
                  <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                    {item.item_type}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '22px', color: 'white', lineHeight: '1.3' }}>{item.title}</h3>
                <p style={{ margin: 0, color: '#adacac', flex: 1, fontSize: '14px', lineHeight: '1.6' }}>{item.description}</p>
                
                <a 
                  href={item.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'rgba(94, 234, 212, 0.1)',
                    color: 'var(--accentColor)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 500,
                    width: '100%',
                    marginTop: '10px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(94, 234, 212, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(94, 234, 212, 0.1)'}
                >
                  <MdDownload /> Download / View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Library;
