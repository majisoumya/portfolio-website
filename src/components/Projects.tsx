import { useState, useEffect } from "react";
import "./styles/Projects.css";
import ProjectModal from "./ProjectModal";
import { supabase } from "../lib/supabase";

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  if (loading) {
    return <div className="projects-section section-container" id="projects"><h2>Loading Projects...</h2></div>;
  }

  const fallbackProjects = [
    { id: "1", title: "Solid Starters", category: "Low-Code Platform", tools: "Angular, Next.js, NestJS, MongoDB", image_url: "/images/Solidx.png", description: "A comprehensive low-code platform for building web applications rapidly.", link: "#" },
    { id: "2", title: "Radix", category: "E-Commerce", tools: "Angular, Next.js, NestJS, CMS", image_url: "/images/radix.png", description: "An advanced e-commerce solution with integrated CMS capabilities.", link: "#" },
    { id: "3", title: "Bond Cancellation", category: "Import-Export Automation", tools: "Angular, Next.js, NestJS, Workflows", image_url: "/images/bond.png", description: "Automated workflow management for import-export bond cancellations.", link: "#" },
    { id: "4", title: "Sapphire", category: "CRM Platform", tools: "AngularJS, NestJS, PostgreSQL", image_url: "/images/sapphire.png", description: "A robust CRM platform for managing customer relationships and sales pipelines.", link: "#" },
    { id: "5", title: "Mpro", category: "Insurance Platform", tools: "React.js, Node.js, Microservices", image_url: "/images/Maxlife.png", description: "A microservices-based platform for insurance policy management.", link: "#" },
  ];

  const displayProjects = projects.length > 0 ? projects : fallbackProjects;

  return (
    <div className="projects-section" id="projects">
      <div className="projects-container section-container">
        <h2>
          My <span>Projects</span>
        </h2>
        
        <div className="projects-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-line"></div>
        </div>

        <div className="projects-track-wrapper">
          <div className="projects-track">
            {displayProjects.map((project, index) => (
              <div 
                className="project-card" 
                key={project.id || index}
                onClick={() => setSelectedProject(project)}
                data-cursor="pointer"
              >
                <div className="project-card-image">
                  <img src={project.image_url || "/images/placeholder.png"} alt={project.title} />
                  <div className="project-card-overlay">
                    <span>View Details</span>
                  </div>
                </div>
                <div className="project-card-info">
                  <div className="project-card-header">
                    <h3>0{index + 1}</h3>
                    <h4>{project.title}</h4>
                  </div>
                  <p>{project.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
};

export default Projects;
