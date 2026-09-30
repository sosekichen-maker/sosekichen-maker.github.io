/* Editable site content. Biography and core identity live in index.html for SEO.
   YOUR_* values never become clickable links. Use relative paths for local assets. */
window.SITE = {
  updated: "2026-09-29", // Real content revision date, not the visitor's current date.
  name: "Siyu Chen",
  portrait: "assets/images/profile.webp", // From the user's supplied LinkedIn profile.
  portrait_alt: "Siyu Chen",
  portrait_is_placeholder: false,
  links: {
    email: "mailto:schen28@villanova.edu",
    scholar: "https://scholar.google.com/citations?user=Qbr2gPIAAAAJ&hl=en",
    github: "https://github.com/sosekichen-maker",
    linkedin: "https://www.linkedin.com/in/siyu-chen-188979128/",
    cv: "assets/cv/Siyu_Chen_CV_09_2026.pdf" // Updated from verified website content, September 2026.
  },
  research: [
    { title: "Deep Brain Stimulation & Neural Implant Mechanics", image: "assets/images/dbs.svg", alt: "Conceptual probe–tissue schematic; not an experimental figure", description: "Experiments, imaging, and computational models connect probe–tissue mechanics with electrode deviation in deep brain stimulation.", publication_ids: ["chen-2026-interface", "zhou-2026-electrode", "chen-2026-dbs", "wang-2026-cel"] },
    { title: "Fluid–Structure Interaction", image: "assets/images/flow.svg", alt: "Conceptual compliant-tube flow schematic; not a simulation result", description: "Experiments and modeling examine how oscillatory flow and internal obstructions deform compliant tubes.", publication_ids: ["sidnawi-2025-oscillatory"] },
    { title: "Particle Transport", image: "assets/images/particles.svg", alt: "Conceptual near-surface particle transport schematic; not a figure from the published paper", description: "Acoustic control of nanoparticle transport and deposition at vessel walls for biomedical drug delivery.", publication_ids: ["wu-2025-acoustic"] }
  ],
  education: [
    { dates: "2022–present", title: "Ph.D. in Mechanical Engineering", organization: "Villanova University", detail: "Ph.D. candidate · Advisor: Prof. Qianhong Wu" },
    { dates: "2019–2021", title: "M.Sc. in Mechanical Engineering", organization: "The Hong Kong Polytechnic University", detail: "Concentration: Experimental Fluid Mechanics" },
    { dates: "2014–2018", title: "B.Sc. in Theoretical and Applied Mechanics", organization: "Southern University of Science and Technology", detail: "" }
  ],
  experience: [
    { dates: "2022–present", title: "Doctoral research", organization: "Villanova University · Mechanical Engineering", detail: "Experimental and computational study of soft material deformation and fluid–structure interaction under Prof. Qianhong Wu, with a focus on DBS probe–tissue mechanics." },
    // Collaboration is verified by publications; no formal appointment or dates inferred.
    { dates: "Research collaboration", title: "Deep brain stimulation biomechanics", organization: "Thomas Jefferson University · University of Delaware", detail: "Collaborative work with Chengyuan Wu, Feroze Mohamed, and Curtis Johnson on probe–tissue interaction, electrode deviation, and gel characterization." }
  ],
  show_awards: true, // Verified scholarships from the supplied CV; no service roles supplied.
  awards: [
    { year: "2023", text: "Scholarship — Philadelphia Society of Tribologists and Lubrication Engineers (STLE)" },
    { year: "2020", text: "Departmental MSc Dissertation Scholarship — The Hong Kong Polytechnic University" }
  ]
};
