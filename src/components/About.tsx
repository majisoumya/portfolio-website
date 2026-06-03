import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./styles/About.css";

const About = () => {
  const [content, setContent] = useState({
    about_title: "About Me",
    about_desc: "Full Stack Developer with 4+ years of experience building scalable web applications using React.js, Angular, Next.js, Node.js, and NestJS. Skilled in microservices architecture, CMS development, and low-code platforms. Passionate about creating high-performance, production-ready solutions from concept to deployment."
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
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">{content.about_title}</h3>
        <p className="para">{content.about_desc}</p>
      </div>
    </div>
  );
};

export default About;
