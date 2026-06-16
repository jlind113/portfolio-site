import { DarkGrads } from "@/style/gradients";
import { AudioVisualizer } from "./audioVisualizer/AudioVisualizer";
import { useEffect, useMemo, useRef, useState } from "react";
import { Progress } from "../ui/progress";
import { Field, FieldLabel } from "../ui/field";

interface Props {
	audioPath: string;
	audioName: string;
}

const AUDIO_CACHE_NAME = "audio-widget-cache-v1";

export default function AudioWidget({ audioPath, audioName }: Props) {
	const visualizerRef = useRef<HTMLCanvasElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	const [blob, setBlob] = useState<Blob | null>(null);
	const [audioSrc, setAudioSrc] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(0);

	const [loadProgress, setLoadProgress] = useState(0);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		let disposed = false;
		const controller = new AbortController();
		let createdObjectUrl: string | null = null;

		const resetState = () => {
			setBlob(null);
			setAudioSrc(null);
			setCurrentTime(0);
			setLoadProgress(0);
			setIsLoaded(false);
			setIsLoading(true);
			setLoadError(null);
		};

		const toBlobWithProgress = async (
			response: Response,
		): Promise<Blob> => {
			const body = response.body;
			if (!body) {
				const noStreamBlob = await response.blob();
				setLoadProgress(100);
				return noStreamBlob;
			}

			const total = Number(response.headers.get("Content-Length") || 0);
			const reader = body.getReader();
			const chunks: BlobPart[] = [];
			let loaded = 0;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (!value) continue;

				chunks.push(value);
				loaded += value.byteLength;

				if (total > 0) {
					const percent = Math.min(
						100,
						Math.round((loaded / total) * 100),
					);
					setLoadProgress(percent);
				}
			}

			if (total === 0) {
				setLoadProgress(100);
			}

			return new Blob(chunks, {
				type: response.headers.get("Content-Type") || "audio/wav",
			});
		};

		const loadAudio = async () => {
			resetState();

			try {
				const request = new Request(audioPath, {
					cache: "force-cache",
				});
				const cache = await caches.open(AUDIO_CACHE_NAME);

				let response = await cache.match(request);

				if (!response) {
					response = await fetch(request, {
						signal: controller.signal,
					});
					if (!response.ok) {
						throw new Error(
							"Failed to fetch audio: " + response.status,
						);
					}
					await cache.put(request, response.clone());
				}

				const loadedBlob = await toBlobWithProgress(response.clone());
				if (disposed) return;

				createdObjectUrl = URL.createObjectURL(loadedBlob);
				setBlob(loadedBlob);
				setAudioSrc(createdObjectUrl);

				setIsLoading(false);
			} catch (error) {
				if (disposed) return;
				if ((error as Error).name === "AbortError") return;

				setLoadError("Unable to load audio.");
				setIsLoading(false);
			}
		};

		loadAudio();

		return () => {
			disposed = true;
			controller.abort();
			if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
		};
	}, [audioPath]);

	const formattedTime = useMemo(() => {
		const minutes = Math.floor(currentTime / 60);
		const seconds = Math.floor(currentTime % 60);
		const paddedSeconds = String(seconds).padStart(2, "0");
		return minutes + ":" + paddedSeconds;
	}, [currentTime]);

	return (
		<div
			className={
				"flex flex-col justify-center items-center w-full " +
				DarkGrads.grays.gray3 +
				" p-4 rounded-md border-2 border-slate-600"
			}
		>
			<p className="text-left w-full text-2xl text-slate-300">
				{audioName}
			</p>
			<p className="text-center w-full text-3xl text-slate-300">
				{formattedTime}
			</p>

			{blob && (
				<AudioVisualizer
					ref={visualizerRef}
					cacheKey={audioPath}
					blob={blob}
					height={100}
					width={800}
					barWidth={3}
					gap={2}
					barColor={"white"}
					barPlayedColor={"#f76565"}
					currentTime={currentTime}
					className={"my-10 max-w-full"}
				/>
			)}

			{!isLoaded && !loadError && (
				<Field>
					<FieldLabel htmlFor={"progress-" + audioName}>
						<span>{isLoading ? "Loading" : "Finalizing"}</span>
						<span className="ml-auto">
							{Math.floor(loadProgress)}%
						</span>
					</FieldLabel>
					<Progress
						value={loadProgress}
						id={"progress-" + audioName}
						className="mb-4"
					/>
				</Field>
			)}

			{loadError && (
				<p className="w-full mb-4 text-sm text-red-300">{loadError}</p>
			)}
            <audio
                ref={audioRef}
                id={audioName}
                src={audioSrc ?? undefined}
                preload="auto"
                onCanPlayThrough={() => {
                    setIsLoaded(true);
                    setLoadProgress(100);
                }}
                onLoadedMetadata={() => {
                    if (loadProgress < 100) setLoadProgress(100);
                }}
                controls={isLoaded}
                controlsList="nodownload noplaybackrate"
                onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime);
                }}
                className={`rounded-full w-full border-2 border-slate-500`}
            />
		</div>
	);
}
