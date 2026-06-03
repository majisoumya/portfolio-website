import { PropsWithChildren, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./styles/Landing.css";

interface LandingContent {
  hero_greeting: string;
  hero_firstname: string;
  hero_lastname: string;
  hero_role_title: string;
  hero_role_1: string;
  hero_role_2: string;
}

const Landing = ({ children }: PropsWithChildren) => {
  const [content, setContent] = useState<LandingContent>({
    hero_greeting: "Hello! I'm",
    hero_firstname: "SOUMYADIP",
    hero_lastname: "MAJI",
    hero_role_title: "A ML ENGINEERE",
    hero_role_1: "Developer",
    hero_role_2: "Engineer"
  });

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

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>{content.hero_greeting}</h2>
            <h1>
              {content.hero_firstname}
              <br />
              <span>{content.hero_lastname}</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>{content.hero_role_title}</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">{content.hero_role_1}</div>
              <div className="landing-h2-2">{content.hero_role_2}</div>
            </h2>
            <h2>
              <div className="landing-h2-info">{content.hero_role_2}</div>
              <div className="landing-h2-info-1">{content.hero_role_1}</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
