import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./styles/Certifications.css";

const Certifications = () => {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // --- SWIPE / DRAG LOGIC ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const { data, error } = await supabase
          .from("certifications")
          .select("*")
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setCertifications(data || []);
      } catch (err) {
        console.error("Error fetching certifications:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertifications();
  }, []);

  if (loading) return null;
  if (certifications.length === 0) return null;

  const handleNext = () => {
    setActiveIndex(prev => Math.min(prev + 1, certifications.length - 1));
  };

  const handlePrev = () => {
    setActiveIndex(prev => Math.max(prev - 1, 0));
  };

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50; 

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouchEnd(null); // Reset touch end
    if ('touches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      setTouchEnd(e.targetTouches[0].clientX);
    } else {
      // Only track if mouse is down
      if (touchStart !== null) {
        setTouchEnd((e as React.MouseEvent).clientX);
      }
    }
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    
    // Reset state
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="certifications-section" id="certifications">
      <div className="section-container">
        <h2>
          My <span>Certifications</span>
        </h2>
        
        <div className="cert-slider-container">
          <button 
            className="cert-nav-btn prev" 
            onClick={handlePrev} 
            disabled={activeIndex === 0}
          >
            &#8249;
          </button>
          
          <div 
            className="certifications-wrapper"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
            onMouseDown={onTouchStart}
            onMouseMove={onTouchMove}
            onMouseUp={onTouchEndHandler}
            onMouseLeave={onTouchEndHandler}
            style={{ cursor: touchStart !== null ? 'grabbing' : 'grab' }}
          >
            <div className="certifications-stack">
              {certifications.map((cert, index) => {
                // Calculate position relative to active index
                const offset = index - activeIndex;
                
                // Hide cards that have been passed (slid to the left)
                const isPassed = offset < 0;
                
                // Max 3 cards visible on the right stack
                const isVisible = offset >= 0 && offset <= 3;
                
                let translateX = 0;
                let scale = 1;
                let opacity = 1;
                let zIndex = certifications.length - index;

                if (isPassed) {
                  translateX = -100; // Slide left and disappear
                  opacity = 0;
                  scale = 0.9;
                } else if (isVisible) {
                  // Stack on the right
                  translateX = offset * 40; // 40px spacing between stacked cards
                  scale = 1 - (offset * 0.05); // scale down slightly
                  opacity = 1 - (offset * 0.1); // fade slightly
                } else {
                  // Too far right to see
                  translateX = 200;
                  opacity = 0;
                }

                return (
                  <div 
                    className="cert-card" 
                    key={cert.id} 
                    style={{ 
                      zIndex,
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      opacity,
                      pointerEvents: offset === 0 ? 'auto' : 'none',
                    }}
                  >
                    <div className="cert-card-inner">
                      {cert.image_url ? (
                        <div className="cert-image-wrapper">
                          <img src={cert.image_url} alt={cert.title} className="cert-image" />
                        </div>
                      ) : (
                        <div className="cert-image-placeholder">🎓</div>
                      )}
                      <div className="cert-content">
                        <span className="cert-date">{cert.date}</span>
                        <h3>{cert.title}</h3>
                        <h4>{cert.issuer}</h4>
                        {cert.description && <p>{cert.description}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            className="cert-nav-btn next" 
            onClick={handleNext} 
            disabled={activeIndex === certifications.length - 1}
          >
            &#8250;
          </button>
        </div>
        
        <div className="cert-dots">
          {certifications.map((_, i) => (
            <span 
              key={i} 
              className={`cert-dot ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Certifications;
