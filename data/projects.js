// ============================================================
//  PORTFOLIO DATA — The only file you need to edit.
//  See README.md for step-by-step instructions.
// ============================================================

var PORTFOLIO_DATA = {

  // ----------------------------------------------------------
  //  YOUR INFO
  //  Edit everything in this block first.
  // ----------------------------------------------------------
  student: {
    name: "Your Name",
    tagline: "Architecture Student",
    school: "School of Architecture, University Name",
    year: "B.Arch, Class of 2027",
    bio: "I'm an undergraduate architecture student exploring the relationship between form, light, and material. My work spans conceptual studio projects, urban design investigations, and built environments.",
    email: "your.email@school.edu",
    linkedin: "",    // Full URL, e.g. "https://linkedin.com/in/yourname" — leave blank to hide
    instagram: "",   // Full URL, e.g. "https://instagram.com/yourhandle" — leave blank to hide
    profileImage: "images/profile/photo.jpg"  // Leave as empty string "" if you don't have a photo yet
  },

  // ----------------------------------------------------------
  //  YOUR PROJECTS
  //  Add, remove, or reorder project blocks below.
  //  The first image in the "images" array appears on the grid.
  //  Set "featured: true" to push a project to the top.
  // ----------------------------------------------------------
  projects: [
    {
      id: "threshold",                         // Unique ID — no spaces, lowercase
      title: "Threshold",
      subtitle: "Design Studio III — Fall 2024",
      description: "An exploration of liminal space in domestic architecture. This project investigates how transitional zones between interior and exterior can become the central organizing element of a residence rather than its overlooked byproduct.",
      tags: ["Residential", "Conceptual"],     // Used for filter buttons
      images: [
        "images/projects/threshold/01.jpg",
        "images/projects/threshold/02.jpg",
        "images/projects/threshold/03.jpg"
      ],
      video: "",   // Paste a YouTube or Vimeo URL here, or leave blank
      featured: true,
      year: "2024"
    },
    {
      id: "urban-void",
      title: "Urban Void",
      subtitle: "Urban Design Studio — Spring 2024",
      description: "A proposal for activating underutilized infrastructure space beneath an elevated highway. The project transforms a 400-meter stretch of dead zone into a layered public landscape that accommodates markets, recreation, and informal gathering.",
      tags: ["Urban Design", "Public Space"],
      images: [
        "images/projects/urban-void/01.jpg",
        "images/projects/urban-void/02.jpg"
      ],
      video: "https://www.youtube.com/watch?v=EXAMPLE",
      featured: true,
      year: "2024"
    },
    {
      id: "material-study",
      title: "Material Studies",
      subtitle: "Structures + Materials — Fall 2023",
      description: "A series of physical models and drawings investigating how brick, concrete, and timber behave differently under compression and tension, and how those material logics can drive architectural form. Each model was built at 1:20 scale.",
      tags: ["Research", "Materials"],
      images: [
        "images/projects/material-study/01.jpg"
      ],
      video: "",
      featured: false,
      year: "2023"
    }
  ]

};
