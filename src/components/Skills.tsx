import { useState, useEffect } from "react";
import "./Skills.css";
import { FaBrain, FaRobot, FaServer, FaCloud, FaChartLine, FaTools, FaLightbulb, FaUsers, FaCode, FaChartPie, FaCogs, FaDatabase, FaEye, FaCommentDots } from "react-icons/fa";

const skillCategories = [
  {
    title: "TIME SERIES & ANALYTICS",
    skills: [
      "Anomaly Detection",
      "Predictive Analytics",
      "Forecasting",
      "Statistical Analysis",
    ],
    color: "#f43f5e", // Rose
    icon: <FaChartLine />,
  },
  {
    title: "TOOLS & PLATFORMS",
    skills: [
      "Canva",
      "Jupyter Notebook",
      "VS Code",
      "Postman",
      "Figma",
      "Docker Hub",
      "GitHub Pages",
    ],
    color: "#8b5cf6", // Violet
    icon: <FaTools />,
  },
  {
    title: "ADVANCED FUTURE-ORIENTED SKILLS",
    skills: [
      "Multi-Agent Systems",
      "Distributed AI Systems",
      "Edge AI",
      "AI Security & Ethics",
      "Federated Learning",
      "AI System Architecture",
      "Real-Time ML Systems",
      "Autonomous AI Workflows",
    ],
    color: "#ec4899", // Pink
    icon: <FaLightbulb />,
  },
  {
    title: "SOFT SKILLS",
    skills: [
      "Problem Solving",
      "Research Mindset",
      "Team Collaboration",
      "Technical Communication",
      "Critical Thinking",
      "Project Management",
    ],
    color: "#10b981", // Emerald
    icon: <FaUsers />,
  },
  {
    title: "PROGRAMMING & SOFTWARE ENGINEERING",
    skills: [
      "JavaScript",
      "python",
      "Object-Oriented Programming (OOP)",
      "Git & GitHub",
      "Backend Development",
      "REST APIs",
      "Data Structures & Algorithms",
    ],
    color: "#eab308", // Yellow
    icon: <FaCode />,
  },
  {
    title: "DATA SCIENCE & DATA PROCESSING",
    skills: [
      "NumPy",
      "Data Cleaning",
      "Data Visualization",
      "Exploratory Data Analysis (EDA)",
      "Pandas",
      "SQL",
      "Data Preprocessing",
      "Matplotlib",
      "Feature Engineering",
    ],
    color: "#06b6d4", // Cyan
    icon: <FaChartPie />,
  },
  {
    title: "MACHINE LEARNING",
    skills: [
      "Supervised Learning",
      "Unsupervised Learning",
      "Regression",
      "Classification",
      "Clustering",
      "Recommendation Systems",
      "Model Evaluation",
      "Hyperparameter Tuning",
      "Scikit-learn",
      "Ensemble Learning",
    ],
    color: "#84cc16", // Lime
    icon: <FaCogs />,
  },
  {
    title: "DEEP LEARNING",
    skills: [
      "Artificial Neural Networks (ANN)",
      "Convolutional Neural Networks (CNN)",
      "Recurrent Neural Networks (RNN)",
      "LSTM",
      "Transformers",
      "Transfer Learning",
      "TensorFlow",
      "PyTorch",
      "Keras",
    ],
    color: "#14b8a6", // Teal
    icon: <FaBrain />,
  },
  {
    title: "AI & GENERATIVE AI",
    skills: [
      "Large Language Models (LLMs)",
      "Retrieval-Augmented Generation (RAG)",
      "Fine-Tuning LLMs",
      "Semantic Search",
      "OpenAI API",
      "Vector Databases",
      "AI Agents",
      "LangChain",
      "Hugging Face",
      "Prompt Engineering",
    ],
    color: "#f97316", // Orange
    icon: <FaRobot />,
  },
  {
    title: "MLOPS & DEVOPS",
    skills: [
      "GitHub Actions",
      "FastAPI",
      "Flask",
      "MLflow",
      "Kubernetes",
      "Model Monitoring",
      "Docker",
      "Model Deployment",
      "CI/CD Pipelines",
      "Apache Airflow",
      "Django",
    ],
    color: "#a855f7", // Purple
    icon: <FaServer />,
  },
  {
    title: "CLOUD & DEPLOYMENT",
    skills: [
      "Nginx",
      "AWS",
      "Render",
      "Linux",
      "Firebase",
      "Supabase",
      "Vercel",
      "Google Cloud Platform (GCP)",
      "Microsoft Azure",
    ],
    color: "#3b82f6", // Blue
    icon: <FaCloud />,
  },
  {
    title: "DATABASES & STORAGE",
    skills: [
      "Redis",
      "FAISS",
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Pinecone",
      "ChromaDB",
    ],
    color: "#6366f1", // Indigo
    icon: <FaDatabase />,
  },
  {
    title: "COMPUTER VISION",
    skills: [
      "Image Classification",
      "Image Segmentation",
      "Object Detection",
      "Face Recognition",
      "OpenCV",
    ],
    color: "#d946ef", // Fuchsia
    icon: <FaEye />,
  },
  {
    title: "NATURAL LANGUAGE PROCESSING (NLP)",
    skills: [
      "Text Classification",
      "Sentiment Analysis",
      "Text Summarization",
      "Embeddings",
      "Named Entity Recognition (NER)",
      "Tokenization",
      "Chatbot Development",
    ],
    color: "#ef4444", // Red
    icon: <FaCommentDots />,
  },
];

const Skills = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % skillCategories.length);
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="skills-section">
      <div className="skills-container carousel-container">
        {skillCategories.map((category, index) => {
          let distance = index - activeIndex;
          // Handle wrap-around for continuous loop effect
          if (distance > skillCategories.length / 2) {
            distance -= skillCategories.length;
          } else if (distance < -skillCategories.length / 2) {
            distance += skillCategories.length;
          }

          const isActive = distance === 0;
          const isVisible = Math.abs(distance) <= 2;

          return (
            <div
              key={index}
              className={`skill-card ${isActive ? 'active' : ''}`}
              style={{ 
                "--card-color": category.color,
                transform: `translateX(calc(-50% + ${distance * 110}%)) scale(${1 - Math.abs(distance) * 0.15}) perspective(1000px) rotateY(${distance * -15}deg)`,
                zIndex: 10 - Math.abs(distance),
                opacity: isVisible ? 1 - Math.abs(distance) * 0.4 : 0,
                pointerEvents: isActive ? "auto" : "none",
                visibility: isVisible ? "visible" : "hidden",
              } as React.CSSProperties}
            >
              <div className="skill-card-header">
                <div className="skill-category-info">
                  <h3>{category.title}</h3>
                  <p>{category.skills.length} skills</p>
                </div>
                <div className="skill-icon-badge">{category.icon}</div>
              </div>
              <div className="skills-list">
                {category.skills.map((skill, i) => (
                  <div key={i} className="skill-chip">
                    <span className="skill-dot"></span>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Skills;
