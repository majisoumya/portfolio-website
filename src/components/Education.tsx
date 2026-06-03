import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./styles/Education.css";

const Education = () => {
  const [educationData, setEducationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const { data, error } = await supabase
          .from("education")
          .select("*")
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setEducationData(data || []);
      } catch (err) {
        console.error("Error fetching education:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEducation();
  }, []);

  const fallbackEducation = [
    { id: "1", degree: "Bachelor of Technology in Computer Science", institution: "XYZ University", period: "2019 - 2023", description: "Graduated with honors. Focused on software engineering, data structures, and web development." },
    { id: "2", degree: "Higher Secondary Education", institution: "ABC High School", period: "2017 - 2019", description: "Completed with distinction, majoring in Mathematics and Computer Science." }
  ];

  if (loading) return null;

  const displayEducation = educationData.length > 0 ? educationData : fallbackEducation;

  return (
    <div className="education-section" id="education">
      <div className="education-container section-container">
        <h2>
          My <span>Education</span>
        </h2>
        <div className="education-timeline">
          {displayEducation.map((item) => (
            <div className="education-item" key={item.id}>
              <div className="education-dot"></div>
              <div className="education-content">
                <span className="education-period">{item.period}</span>
                <div className="education-header">
                  {item.logo_url && (
                    <img src={item.logo_url} alt={`${item.institution} logo`} className="education-logo" />
                  )}
                  <div className="education-titles">
                    <h3>{item.degree}</h3>
                    <h4>{item.institution}</h4>
                  </div>
                </div>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Education;
