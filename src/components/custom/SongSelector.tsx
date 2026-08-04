import { ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface Track {
	title: string;
	genre: string;
	link: string;
}

interface Props {
	tracks: Track[];
	selectedTrack: Track | null;
	onSelect: (track: Track) => void;
}

export default function SongSelector({ tracks, selectedTrack, onSelect }: Props) {
	const grouped = tracks.reduce<Record<string, Track[]>>((acc, track) => {
		(acc[track.genre] ??= []).push(track);
		return acc;
	}, {});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center justify-between w-full rounded-lg border border-slate-700/50 bg-slate-900 px-4 py-3 text-sm text-slate-200 hover:border-slate-500 transition-colors">
					<span className={selectedTrack ? "text-slate-100" : "text-slate-500"}>
						{selectedTrack ? selectedTrack.title : "Select a song..."}
					</span>
					{selectedTrack && (
						<span className="text-xs text-slate-500 mx-2">{selectedTrack.genre}</span>
					)}
					<ChevronDown className="size-4 text-slate-500 shrink-0" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) bg-slate-900 border-slate-700 text-slate-200"
				align="start"
			>
				{Object.entries(grouped).map(([genre, genreTracks]) => (
					<DropdownMenuGroup key={genre}>
						<DropdownMenuLabel className="text-xs uppercase tracking-widest text-slate-500 px-2 pt-2">
							{genre}
						</DropdownMenuLabel>
						{genreTracks.map((track) => (
							<DropdownMenuItem
								key={track.link}
								onClick={() => onSelect(track)}
								className="text-slate-300 focus:bg-slate-800 focus:text-slate-100 cursor-pointer pl-4"
							>
								{selectedTrack?.link === track.link && (
									<span className="text-slate-500 mr-1">›</span>
								)}
								{track.title}
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
