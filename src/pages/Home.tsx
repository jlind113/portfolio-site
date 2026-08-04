import { NavLink } from "react-router";

export default function Home() {
	return (
		<div className="w-full h-full flex flex-col items-center overflow-y-auto">
			{/* Hero */}
			<section className="w-full max-w-3xl flex flex-col items-center text-center pt-16 pb-10 px-4 gap-5">
				<div className="size-50 rounded-full overflow-hidden flex flex-col justify-center items-center border border-slate-700">
					<div className="w-62.5 h-50 flex items-center justify-center">
						<img
							src="photos/Professional Photos/ProfessionalPhoto-250w-200h.png"
							className="w-62.5 h-50"
						/>
					</div>
				</div>
				<div className="flex flex-col items-center gap-1">
					<h1 className="text-4xl font-bold tracking-tight text-slate-100">
						Jack Lindgren
					</h1>
					<p className="text-base font-medium text-slate-500 uppercase tracking-widest">
						Software Engineer
					</p>
				</div>
				<p className="text-base text-center text-slate-400 max-w-xl leading-relaxed">
					Software Engineer based in Centerville, UT, focused on
					building a wide range of technologies. Such as websites,
					Windows applications, video games, mobile applications, and
					anything else. Graduate of Davis Technical College's
					Software Development program with a 3.85 GPA and a National
					Technical Honor Society member.
				</p>

				{/* CTAs */}
				<div className="flex flex-row gap-3 mt-1 flex-wrap justify-center">
					<NavLink
						to="/Projects"
						className="px-6 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 font-semibold hover:border-slate-500 transition-colors"
					>
						View Projects
					</NavLink>
					<NavLink
						to="/Contact"
						className="px-6 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 font-semibold hover:border-slate-500 transition-colors"
					>
						Get In Touch
					</NavLink>
				</div>

				{/* Social Links */}
				<div className="flex flex-row gap-6 mt-1 text-sm text-slate-500">
					<a
						href="https://github.com/jlind113"
						target="_blank"
						rel="noreferrer"
						className="hover:text-slate-200 transition-colors"
					>
						GitHub
					</a>
					<span className="text-slate-700">|</span>
					<a
						href="https://www.linkedin.com/in/jack-lindgren"
						target="_blank"
						rel="noreferrer"
						className="hover:text-slate-200 transition-colors"
					>
						LinkedIn
					</a>
					<span className="text-slate-700">|</span>
					<a
						href="mailto:jackmarkcharleslindgren@gmail.com"
						className="hover:text-slate-200 transition-colors"
					>
						Email
					</a>
				</div>
			</section>
		</div>
	);
}
