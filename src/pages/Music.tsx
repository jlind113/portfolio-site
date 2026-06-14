import { MusicLinks } from "@/util/MyInfo";
import { XyzTransition } from "@animxyz/react";
import AudioWidget from "@/components/custom/AudioWidget";

export default function Music() {
	return (
		<div className="flex flex-col items-center w-full h-full">
			<div className="flex flex-col items-center w-full h-full">
				<h1 className="text-5xl pb-10 text-center">My Music</h1>
				<ul className="w-2/3">
					{MusicLinks.map((track) => (
						<XyzTransition
							appear
							xyz="fade down back flip-up-25% origin-bottom duration-20 ease-out-back"
							key={track.title}
						>
							<li
								key={track.title}
								className={`my-4`}
							>
								<AudioWidget
									audioPath={track.link}
									audioName={track.title}
								/>
							</li>
						</XyzTransition>
					))}
				</ul>
			</div>
		</div>
	);
}
