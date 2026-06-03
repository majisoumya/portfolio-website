import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import HoverLinks from "./HoverLinks";

const SocialIcons = () => {
  const [resumeUrl, setResumeUrl] = useState("#");
  const [socials, setSocials] = useState({
    social_github: "https://github.com/",
    social_linkedin: "https://linkedin.com/",
    social_twitter: "https://x.com/",
    social_instagram: "https://instagram.com/"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from("settings").select("*");
      
      if (!error && data) {
        let resume = "#";
        const newSocials = { ...socials };
        data.forEach((item: any) => {
          if (item.key === "resume_url") {
            resume = item.value;
          } else if (item.key in newSocials) {
            (newSocials as any)[item.key] = item.value;
          }
        });
        setResumeUrl(resume);
        setSocials(newSocials);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const social = document.getElementById("social") as HTMLElement;

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;

      const rect = elem.getBoundingClientRect();
      let mouseX = rect.width / 2;
      let mouseY = rect.height / 2;
      let currentX = 0;
      let currentY = 0;

      const updatePosition = () => {
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        requestAnimationFrame(updatePosition);
      };

      const onMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 40 && x > 10 && y < 40 && y > 5) {
          mouseX = x;
          mouseY = y;
        } else {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
      };

      document.addEventListener("mousemove", onMouseMove);

      updatePosition();

      return () => {
        elem.removeEventListener("mousemove", onMouseMove);
      };
    });
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href={socials.social_github} target="_blank" rel="noreferrer">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href={socials.social_linkedin} target="_blank" rel="noreferrer">
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={socials.social_twitter} target="_blank" rel="noreferrer">
            <FaXTwitter />
          </a>
        </span>
        <span>
          <a href={socials.social_instagram} target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
        </span>
      </div>
      <a className="resume-button" href={resumeUrl} target="_blank" rel="noreferrer">
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
