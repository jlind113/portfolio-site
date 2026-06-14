import { DarkGrads } from "@/style/gradients";
import { AudioVisualizer } from "./audioVisualizer/AudioVisualizer";
import { useEffect, useRef, useState } from "react";

interface Props {
    audioPath: string,
    audioName: string,
}

export default function AudioWidget({audioPath, audioName}: Props) {
    const [blob, setBlob] = useState<Blob>();
	const visualizerRef = useRef<HTMLCanvasElement>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const audioRef = useRef<HTMLAudioElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const loadBlob = async () => {
			const response = await fetch(audioPath);
			const wavBlob = await response.blob();
			setBlob(wavBlob);
		};

		loadBlob();
	}, []);

    function PrettyTime(string: any, pad: any, length: any) {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    }

    function FormatTime() {
        var minutes = Math.floor(currentTime / 60);
        var seconds = Math.floor(currentTime % 60);
        var formattedTime = minutes + ":" + PrettyTime(seconds, "0", 2);
        return formattedTime;
    }

    function HandleLoading(e: boolean) {
        setIsLoaded(e);
    }

    return (
        <div className={`flex flex-col justify-center items-center w-full ${DarkGrads.grays.gray3} p-4 rounded-md border-2 border-slate-600`}>
            <p className="text-left w-full text-2xl text-slate-300">{audioName}</p>
            <p className="text-center w-full text-3xl text-slate-300">{FormatTime()}</p>
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
                    className={`my-10 max-w-full`}
                />
            )}
            
            <audio 
                ref={audioRef}
                id={audioName}
                src={audioPath}
                onLoadedData={() => {HandleLoading(true)}}
                controls={isLoaded}
                controlsList="nodownload noplaybackrate"
                onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime)
                }}
                className={`rounded-md`}
                style={{width: "100%"}}
            />
        </div>
    )
}