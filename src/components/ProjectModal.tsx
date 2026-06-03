import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdArrowOutward } from "react-icons/md";
import "./styles/ProjectModal.css";
import ProjectImage from "./ProjectImage";
import { smoother } from "./Navbar";

interface Props {
  project: any;
  onClose: () => void;
}

const ProjectModal = ({ project, onClose }: Props) => {
  useEffect(() => {
    // Pause GSAP ScrollSmoother to prevent background scrolling
    if (smoother) {
      smoother.paused(true);
    } else {
      document.body.style.overflow = "hidden";
    }
    
    // Add escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      // Resume GSAP ScrollSmoother
      if (smoother) {
        smoother.paused(false);
      } else {
        document.body.style.overflow = "";
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const modalContent = (
    <div className="project-modal-overlay" onClick={onClose}>
      <div className="project-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="project-modal-close" onClick={onClose} data-cursor="disable">
          <MdClose />
        </button>
        
        <div className="project-modal-body">
          <div className="project-modal-image-container">
            <ProjectImage image={project.image_url || project.image} alt={project.title} />
          </div>
          
          <div className="project-modal-details">
            <h2>{project.title}</h2>
            <p className="project-modal-category">{project.category}</p>
            
            <div className="project-modal-desc">
              <p>{project.description}</p>
            </div>
            
            <div className="project-modal-tools">
              <span className="tools-label">Tools & Features</span>
              <p>{project.tools}</p>
            </div>
            
            {project.link && (
              <a href={project.link} target="_blank" rel="noreferrer" className="project-modal-link" data-cursor="disable">
                Visit Project <MdArrowOutward />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render the modal into document.body using a Portal.
  // This bypasses the GSAP #smooth-content transform which breaks position: fixed.
  return createPortal(modalContent, document.body);
};

export default ProjectModal;
