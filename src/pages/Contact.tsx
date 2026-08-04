import { ContactInfo } from "@/util/MyInfo";

export default function Contact() {
	return (
		<div className="w-full h-full flex flex-col items-center overflow-y-auto">
			<section className="w-full max-w-2xl pt-14 pb-16 px-4 flex flex-col items-center gap-8">
				{/* Header */}
				<div className="flex flex-col items-center">
					<h1 className="text-4xl font-bold tracking-tight text-slate-100">
						Get In Touch
					</h1>
					<div className="mt-3 h-px w-24 bg-slate-500" />
					<p className="text-slate-400 text-sm text-center mt-4 max-w-md">
						Open to freelance work, full-time opportunities, and
						interesting collaborations. Feel free to reach out
						through any of the channels below.
					</p>
				</div>

				{/* Contact cards */}
				<div className="w-full flex flex-col gap-3">
					{ContactInfo.map((item) => (
						<a
							key={item.label}
							href={item.href}
							{...(item.external
								? { target: "_blank", rel: "noreferrer" }
								: {})}
							className="flex flex-row items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-800/40 px-6 py-4 hover:border-purple-600/60 hover:bg-slate-800/60 transition-all group"
						>
							<span className="text-xs font-semibold text-slate-400 uppercase tracking-widest w-24">
								{item.label}
							</span>
							<span className="text-slate-200 text-sm group-hover:text-purple-300 transition-colors flex-1 text-right">
								{item.value}
							</span>
							<span className="text-slate-600 group-hover:text-purple-400 transition-colors ml-3">
								›
							</span>
						</a>
					))}
				</div>
			</section>
		</div>
	);
}
