import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./styles/Career.css";

const Career = () => {
  const [experienceData, setExperienceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const { data, error } = await supabase
          .from("experience")
          .select("*")
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setExperienceData(data || []);
      } catch (err) {
        console.error("Error fetching experience:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExperience();
  }, []);

  const fallbackExperience = [
    {
      id: "1",
      role: "Full Stack Developer",
      company: "Ikshan",
      period: "2020",
      description: "Built 6+ complete applications using React.js. Integrated backend authentication using Node.js & MongoDB. Created responsive UI/UX and designed wireframes using Figma."
    },
    {
      id: "2",
      role: "Senior Full Stack Developer",
      company: "Monocept",
      period: "2021",
      description: "Led two development teams on Mpro, a large-scale insurance operations platform. Developed multiple modules using React.js & migrated critical functionalities to Node.js microservices."
    },
    {
      id: "3",
      role: "Full Stack Developer",
      company: "Logic Loop",
      period: "NOW",
      description: "Building Solid, a proprietary low-code platform using Angular, Next.js & NestJS. Delivering production-ready CMS-based projects including e-commerce, CRM, and import-export automation systems."
    }
  ];

  if (loading) return null;

  const displayExperience = experienceData.length > 0 ? experienceData : fallbackExperience;

  return (
    <div className="career-section" id="experience">
      <div className="career-container section-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info centered-timeline">
          <div className="career-timeline-line"></div>
          {displayExperience.map((item, index) => (
            <div className={`career-timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={item.id}>
              <div className="career-dot-new"></div>
              <div className="career-info-box">
                <div className="career-header-row">
                  <div className="career-company-info">
                    {item.logo_url && (
                      <img 
                        src={item.logo_url} 
                        alt={`${item.company} logo`} 
                        className="career-logo"
                      />
                    )}
                    <div className="career-titles">
                      <h4>{item.role}</h4>
                      <h5>{item.company}</h5>
                    </div>
                  </div>
                  <div className="career-period-badge">
                    {item.period}
                  </div>
                </div>
                <p className="career-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
