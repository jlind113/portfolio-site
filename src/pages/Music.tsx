import { useState } from "react";
import { MusicLinks } from "@/util/MyInfo";
import SongSelector, { type Track } from "@/components/custom/SongSelector";
import AudioWidget from "@/components/custom/AudioWidget";

export default function Music() {
	const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

	return (
		<div className="w-full h-full flex flex-col items-center overflow-y-auto">
			<section className="w-full max-w-3xl pt-14 pb-16 px-4">
				<div className="flex flex-col items-center mb-10">
					<h1 className="text-4xl font-bold tracking-tight text-slate-100">
						My Music
					</h1>
					<div className="mt-3 h-px w-24 bg-slate-500" />
				</div>

				<SongSelector
					tracks={MusicLinks}
					selectedTrack={selectedTrack}
					onSelect={setSelectedTrack}
				/>

				{selectedTrack && (
					<div className="mt-4">
						<AudioWidget
							key={selectedTrack.link}
							audioPath={selectedTrack.link}
							audioName={selectedTrack.title}
						/>
					</div>
				)}
			</section>
		</div>
	);
}
