import { MusicLinks } from "@/util/MyInfo";
import { XyzTransition } from "@animxyz/react";

export default function Music() {
	return (
		<div className="flex flex-col items-center w-full h-full">
			<div className="flex flex-col items-center w-full h-full">
				<h1 className="text-5xl pb-10 text-center">My Music</h1>
				<ul>
					{MusicLinks.map((track) => (
						<XyzTransition
							appear
							xyz="fade down back flip-up-25% origin-bottom duration-20 ease-out-back"
						>
							<li key={track.title} className="py-4">
								<span className="flex flex-row">
									<p
										className={`text-xl pb-2 text-slate-300 font-bold text-left flex-3`}
									>
										{track.title}
									</p>
									<p
										className={`text-xl pb-2 text-slate-300 font-bold text-right flex-1`}
									>
										{track.genre}
									</p>
								</span>
								<iframe
									className="rounded-md shadow-lg border-2 border-slate-400"
									width={"600"}
									height={"150"}
									src={`https://w.soundcloud.com/player/?url=${track.link}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
								/>
							</li>
						</XyzTransition>
					))}
				</ul>
			</div>
		</div>
	);
}
