import { DarkGrads } from "@/style/gradients";
import { NavLink } from "react-router";

export default function Home() {
	return (
		<div className="w-full h-full flex flex-col items-center overflow-y-auto ">
			{/* Hero */}
			<section className="w-full max-w-3xl flex flex-col items-center text-center pt-16 pb-10 gap-4">
				<div className="size-50 rounded-full overflow-hidden flex flex-col justify-center items-center border-2 border-slate-500">
					<div className="w-62.5 h-50 flex items-center justify-center shadow-lg">
						<img
							src="photos/Professional Photos/ProfessionalPhoto-250w-200h.png"
							className="w-62.5 h-50"
						/>
					</div>
				</div>
				<h1 className="text-5xl font-bold tracking-tight text-white">
					Jack Lindgren
				</h1>
				<p className="text-2xl text-purple-300 font-medium">
					Software Engineer
				</p>
				<p className="text-xl text-center text-slate-200 max-w-2xl leading-relaxed">
					Software Engineer based in Centerville, UT, focused on
					building a wide range of technologies. Such as websites,
					Windows applications, video games, mobile applications, and
					anything else. Graduate of Davis Technical College's
					Software Development program with a 3.85 GPA and a National
					Technical Honor Society member.
				</p>

				{/* CTAs */}
				<div className="flex flex-row gap-4 mt-2 flex-wrap justify-center">
					<NavLink
						to="/Projects"
						className={`px-6 py-2.5 rounded-md ${DarkGrads.grays.gray2} border-2 border-slate-500 text-lg text-slate-200 font-semibold hover:scale-105`}
					>
						View Projects
					</NavLink>
					<NavLink
						to="/Contact"
						className={` px-6 py-2.5 rounded-md border-2 ${DarkGrads.grays.gray2} border-slate-500 text-lg text-slate-200 font-semibold hover:scale-105`}
					>
						Get In Touch
					</NavLink>
				</div>

				{/* Social Links */}
				<div className="flex flex-row gap-6 mt-1 text-md text-slate-400">
					<a
						href="https://github.com/jlind113"
						target="_blank"
						rel="noreferrer"
						className="hover:text-purple-300 transition-colors"
					>
						GitHub
					</a>
					<span className="text-slate-600">|</span>
					<a
						href="https://www.linkedin.com/in/jack-lindgren"
						target="_blank"
						rel="noreferrer"
						className="hover:text-purple-300 transition-colors"
					>
						LinkedIn
					</a>
					<span className="text-slate-600">|</span>
					<a
						href="mailto:jackmarkcharleslindgren@gmail.com"
						className="hover:text-purple-300 transition-colors"
					>
						Email
					</a>
				</div>
			</section>
		</div>
	);
}
