import { Education, Certifications, MySkills } from "@/util/MyInfo";
import { darkMode } from "@/style/gradients";

export default function Skills() {
	return (
		<div className="w-full h-full flex flex-col items-center overflow-y-auto">
			<section className="w-full max-w-3xl pt-14 pb-16">
				<h1 className="text-5xl font-bold text-white text-center mb-4">
					MY SKILLS
				</h1>

        {/* Divider */}
				<div className="border-t border-slate-700/60 mb-4" />

				{/* Skill groups */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
					{MySkills.map((group) => (
						<div
							key={group.label}
							className={`flex flex-col items-center rounded-md border border-slate-700/60 ${darkMode.purples.purple1} p-4 gap-2`}
						>
							<h2 className={"text-md text-center font-semibold text-slate-400 uppercase tracking-widest"}>
								{group.label}
							</h2>
							<div className="flex flex-wrap gap-2">
								{group.skills.map((s) => (
									<span
										key={s}
										className="text-md px-4 py-1 text-slate-200"
									>
										{s}
									</span>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Divider */}
				<div className="border-t border-slate-700/60 mb-4" />

				{/* Education & Certifications */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
					{/* Education */}
					<div className={`flex flex-col rounded-md border border-slate-700/60 ${darkMode.purples.purple1} p-4 gap-2`}>
						<h2 className={"text-md text-center font-semibold text-slate-400 uppercase tracking-widest"}>
							Education
						</h2>
						{Education.map((e) => (
							<div
								key={e.title}
								className="flex flex-col gap-0.5"
							>
								<p className="text-white font-medium text-sm">
									{e.title}
								</p>
								<p className="text-purple-300 text-sm">
									{e.institution}
								</p>
								{e.detail && (
									<p className="text-slate-400 text-xs">
										{e.detail}
									</p>
								)}
							</div>
						))}
					</div>

					{/* Certifications */}
					<div className={`flex flex-col rounded-md border border-slate-700/60 ${darkMode.purples.purple1} p-4 gap-2`}>
						<h2 className={"text-md text-center font-semibold text-slate-400 uppercase tracking-widest"}>
							Certifications
						</h2>
						{Certifications.map((c) => (
							<div
								key={c.title}
								className="flex flex-col gap-0.5"
							>
								<p className="text-white font-medium text-sm">
									{c.title}
								</p>
								<p className="text-purple-300 text-sm">
									{c.institution}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
