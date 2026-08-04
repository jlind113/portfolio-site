import { Education, Certifications, MySkills } from "@/util/MyInfo";

export default function Skills() {
	return (
		<div className="w-full h-full flex flex-col items-center overflow-y-auto">
			<section className="w-full max-w-3xl pt-14 pb-16 px-4">

				{/* Page heading */}
				<div className="flex flex-col items-center mb-10">
					<h1 className="text-4xl font-bold tracking-tight text-slate-100">
						Skills &amp; Qualifications
					</h1>
					<div className="mt-3 h-px w-24 bg-slate-500" />
				</div>

				{/* Skill groups */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
					{MySkills.map((group) => (
						<div
							key={group.label}
							className="flex flex-col gap-3 rounded-lg border border-slate-700/50 bg-slate-900 p-5"
						>
							<h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
								{group.label}
							</h2>
							<div className="flex flex-wrap gap-2">
								{group.skills.map((s) => (
									<span
										key={s}
										className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-slate-200"
									>
										{s}
									</span>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Divider */}
				<div className="border-t border-slate-800 mb-8" />

				{/* Education & Certifications */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

					{/* Education */}
					<div className="flex flex-col gap-4 rounded-lg border border-slate-700/50 bg-slate-900 p-5">
						<h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
							Education
						</h2>
						{Education.map((e) => (
							<div key={e.title} className="flex flex-col gap-0.5">
								<p className="text-sm font-semibold text-slate-100">
									{e.title}
								</p>
								<p className="text-sm text-slate-400">
									{e.institution}
								</p>
								{e.detail && (
									<p className="text-xs text-slate-500">
										{e.detail}
									</p>
								)}
							</div>
						))}
					</div>

					{/* Certifications */}
					<div className="flex flex-col gap-4 rounded-lg border border-slate-700/50 bg-slate-900 p-5">
						<h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
							Certifications
						</h2>
						{Certifications.map((c) => (
							<div key={c.title} className="flex flex-col gap-0.5">
								<p className="text-sm font-semibold text-slate-100">
									{c.title}
								</p>
								<p className="text-sm text-slate-400">
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
