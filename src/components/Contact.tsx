import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { MdEmail, MdArrowOutward, MdCopyright, MdPhone } from "react-icons/md";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import "./styles/Contact.css";

const Contact = () => {
  const [content, setContent] = useState({
    contact_email: "soumyadipmaji643@gmail.com",
    contact_edu: "B.Tech in Computer Science And Engineering",
    footer_name: "Soumyadip Maji",
    social_github: "https://github.com/majisoumya",
    social_linkedin: "https://www.linkedin.com/in/soumyadip-maji-8b97672a7",
    social_twitter: "https://x.com/Soumyad95528237",
    social_instagram: "https://www.instagram.com"
  });

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    website: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (!error && data) {
        const newContent = { ...content };
        data.forEach((item: any) => {
          if (item.key in newContent) {
            (newContent as any)[item.key] = item.value;
          }
        });
        setContent(newContent);
      }
    };
    fetchContent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${content.contact_email}`, {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: formState.name,
            email: formState.email,
            website: formState.website,
            message: formState.message
        })
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormState({ name: "", email: "", website: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }
  };

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h2 className="section-title slide-up-anim">
          Contact <span className="gradient-text-alt">Me</span>
        </h2>
        <div className="contact-split">
          
          {/* Left: Contact Form */}
          <div className="contact-form-side slide-up-anim">
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="input-group">
                <input type="text" name="name" id="name" value={formState.name} onChange={handleChange} required />
                <label htmlFor="name" className={formState.name ? 'active-label' : ''}>Your name</label>
              </div>
              <div className="input-group">
                <input type="email" name="email" id="email" value={formState.email} onChange={handleChange} required />
                <label htmlFor="email" className={formState.email ? 'active-label' : ''}>Email</label>
              </div>
              <div className="input-group">
                <input type="text" name="website" id="website" value={formState.website} onChange={handleChange} />
                <label htmlFor="website" className={formState.website ? 'active-label' : ''}>Your website (If exists)</label>
              </div>
              <div className="input-group">
                <textarea name="message" id="message" rows={4} value={formState.message} onChange={handleChange} required></textarea>
                <label htmlFor="message" className={formState.message ? 'active-label' : ''}>How can I help?*</label>
              </div>
              
              <div className="form-footer">
                <button type="submit" className="get-in-touch-btn" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Sending..." : submitStatus === "success" ? "Sent Successfully!" : submitStatus === "error" ? "Error Sending" : "Get In Touch"}</span>
                </button>
                <div className="social-icons-row">
                  <a href={content.social_github} target="_blank" rel="noreferrer"><FaGithub /></a>
                  <a href={content.social_linkedin} target="_blank" rel="noreferrer"><FaLinkedin /></a>
                  <a href={content.social_twitter} target="_blank" rel="noreferrer"><FaTwitter /></a>
                  <a href={content.social_instagram} target="_blank" rel="noreferrer"><FaInstagram /></a>
                </div>
              </div>
            </form>
          </div>

          {/* Right: CTA Text */}
          <div className="contact-text-side fade-in-anim">
            <h1 className="animated-heading">
              Let's <span className="gradient-text">talk</span> for <br/> Something special
            </h1>
            <p className="contact-description">
              I seek to push the limits of creativity to create high-engaging, user-friendly, and memorable interactive experiences. Let's build something amazing together.
            </p>
            <div className="contact-info-block">
              <div className="info-item">
                <div className="info-icon"><MdEmail /></div>
                <a href={`mailto:${content.contact_email}`}>{content.contact_email}</a>
              </div>
              <div className="info-item">
                <div className="info-icon"><MdPhone /></div>
                <a href="tel:+918670430881">+91 8670430881</a>
              </div>
            </div>
            
            <div className="copyright-block">
              <h5>
                Designed and Developed by <br/> <span className="accent-color">{content.footer_name}</span>
              </h5>
              <p className="copyright-text"><MdCopyright /> {new Date().getFullYear()}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
