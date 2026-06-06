interface Project {
  title: string;
  description: string;
  tech: string[];
  category: "Freelance" | "Academic" | "Personal";
  highlights: string[];
}

const projects: Project[] = [
  {
    title: "MJF Home Solutions",
    category: "Freelance",
    description:
      "Production-ready single-page business website for a Utah-based home improvement company. Features a filterable project gallery, service detail pages, and a structured customer lead form.",
    tech: ["React 19", "React Router 7", "Material UI", "Tailwind CSS", "Vite", "Netlify"],
    highlights: [
      "SEO-optimized per-route metadata for search and social sharing",
      "JSON-driven service architecture for scalable content management",
      "Custom light/dark theme with branded Material UI design system",
    ],
  },
  {
    title: "Jack's Guitar Shop",
    category: "Academic",
    description:
      "Full-stack PHP/MySQL e-commerce application supporting product browsing, account management, shopping cart, and checkout. Includes a role-based admin panel for customer and inventory management.",
    tech: ["PHP", "MySQL", "HTML", "CSS", "Bootstrap 3"],
    highlights: [
      "Complete checkout flow with inventory validation and purchase history",
      "Role-based access separating customer and admin workflows",
      "Session-based authentication with email activation",
    ],
  },
  {
    title: "Invoicing & Inventory App",
    category: "Academic",
    description:
      "Desktop invoicing and inventory reporting tool built with C# and .NET 8 Windows Forms. Uses LINQ queries to generate invoice detail reports, inventory sales summaries, and per-customer financial rollups.",
    tech: ["C#", ".NET 8", "Windows Forms", "LINQ"],
    highlights: [
      "Multi-entity LINQ joins across customers, products, invoices, and line items",
      "Custom Date class with validation, leap-year handling, and operator overloading",
      "Async event handlers to maintain UI responsiveness during report generation",
    ],
  },
  {
    title: "Super Beat Maker",
    category: "Personal",
    description:
      "A roguelike-style beat production challenge app. Players roll randomized Mutations, Curses, and Track Types that constrain composition decisions across a run of rooms, with session persistence and a full reference section.",
    tech: ["React 19", "TypeScript", "Vite", "shadcn/ui", "Tailwind CSS v4"],
    highlights: [
      "Custom React Context managing full run lifecycle and room gameplay state",
      "Local storage sync for durable session continuation and end-run cleanup",
      "d100-style randomization engine mapped to large probability table datasets",
    ],
  },
  {
    title: "Trip Tracker",
    category: "Academic",
    description:
      "Mobile trip-tracking app built with React Native and Expo. Authenticated users can create trips with a custom title, camera photo, and GPS or map-picked location, then review saved trips with address and map visualization.",
    tech: ["React Native", "Expo", "Firebase Auth", "Firebase Realtime DB", "SQLite", "Google Maps"],
    highlights: [
      "Camera capture and GPS/map-picker location workflows with runtime permissions",
      "Firebase Authentication with context-based route gating",
      "SQLite local CRUD for offline-reliable trip persistence",
    ],
  },
];

const categoryColors: Record<Project["category"], string> = {
  Freelance: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
  Academic: "bg-blue-900/50 text-blue-300 border-blue-700",
  Personal: "bg-purple-900/50 text-purple-300 border-purple-700",
};

export default function Projects() {
  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto">
      <section className="w-full max-w-3xl pt-14 pb-16">
        <h1 className="text-5xl font-bold text-white text-center mb-2">Projects</h1>
        <p className="text-slate-400 text-center mb-10">A selection of work spanning freelance, academic, and personal projects.</p>

        <div className="flex flex-col gap-6">
          {projects.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 flex flex-col gap-4 hover:border-purple-600/50 transition-colors"
            >
              {/* Header */}
              <div className="flex flex-row items-start justify-between gap-4 flex-wrap">
                <h2 className="text-xl font-semibold text-white">{p.title}</h2>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColors[p.category]}`}
                >
                  {p.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm leading-relaxed">{p.description}</p>

              {/* Highlights */}
              <ul className="flex flex-col gap-1">
                {p.highlights.map((h) => (
                  <li key={h} className="text-slate-400 text-sm flex flex-row gap-2">
                    <span className="text-purple-500 mt-0.5">›</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2 pt-1">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}