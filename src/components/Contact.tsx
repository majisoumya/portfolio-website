import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { MdArrowOutward, MdCopyright } from "react-icons/md";
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

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (!error && data) {
        const newContent = { ...content };
        data.forEach(item => {
          if (item.key in newContent) {
            (newContent as any)[item.key] = item.value;
          }
        });
        setContent(newContent);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${content.contact_email}`} data-cursor="disable">
                {content.contact_email}
              </a>
            </p>
            <h4>Education</h4>
            <p>{content.contact_edu}</p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a href={content.social_github} target="_blank" data-cursor="disable" className="contact-social">
              Github <MdArrowOutward />
            </a>
            <a href={content.social_linkedin} target="_blank" data-cursor="disable" className="contact-social">
              Linkedin <MdArrowOutward />
            </a>
            <a href={content.social_twitter} target="_blank" data-cursor="disable" className="contact-social">
              Twitter <MdArrowOutward />
            </a>
            <a href={content.social_instagram} target="_blank" data-cursor="disable" className="contact-social">
              Instagram <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by <span>{content.footer_name}</span>
            </h2>
            <h5>
              <MdCopyright /> {new Date().getFullYear()}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
