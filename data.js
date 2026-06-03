// ============================================================
//  data.js — Portfolio content. Edit via admin.html or here.
// ============================================================

const PORTFOLIO_DATA = {
  skills: [
    {
      category: "Languages",
      icon: "{ }",
      items: ["HTML", "CSS", "JavaScript", "Python", "C++", "SQL"],
    },
    {
      category: "Libraries & Frameworks",
      icon: "⚡",
      items: ["Pandas", "Matplotlib", "NumPy"],
    },
    {
      category: "Tools & Platforms",
      icon: "🛠",
      items: ["Git", "GitHub", "Tableau", "VS Code"],
    },
  ],

  projects: [
    {
      id: 1,
      title: "Portfolio Website",
      description:
        "Personal developer portfolio showcasing projects, skills, and contact information, built with responsive design principles.",
      tags: ["HTML", "CSS", "JavaScript"],
      category: "web",
      url: "https://obiwankelp.github.io/portfolio/",
      featured: true,
    },
    {
      id: 2,
      title: "Truly Indian",
      description:
        "Static website prototype focused on layout, styling, and basic interactivity using core web technologies.",
      tags: ["HTML", "CSS", "JavaScript"],
      category: "web",
      url: "https://obiwankelp.github.io/Truly_Indian_1/",
      featured: false,
    },
    {
      id: 3,
      title: "IPL Management System",
      description:
        "Database-driven web project designed for DBMS coursework, focusing on data organization and CRUD operations.",
      tags: ["HTML", "CSS", "JavaScript", "DBMS"],
      category: "db",
      url: "https://github.com/ObiWanKelp/ipl-stats",
      featured: true,
    },
    {
      id: 4,
      title: "Cafe Sales Analysis",
      description:
        "Data cleaning and exploratory analysis on a 10,000+ row cafe sales dataset to extract revenue and customer insights.",
      tags: ["Python", "Pandas", "Matplotlib", "Data Analysis"],
      category: "data",
      url: "https://github.com/ObiWanKelp/CafeSales1",
      featured: true,
    },
    {
      id: 5,
      title: "Synthetic User Data Cleaning",
      description:
        "End-to-end data cleaning pipeline on a synthetic user dataset, handling missing values, inconsistencies, and invalid entries.",
      tags: ["Python", "Pandas", "Data Cleaning"],
      category: "data",
      url: "https://github.com/ObiWanKelp/Syntetic-Data-Analysis",
      featured: false,
    },
  ],
};
