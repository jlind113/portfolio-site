export const controls = {
    buttons: {
        spacing: "px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer",
        active: "bg-purple-900/50 border-purple-400 text-[#FFFFFF]",
        inactive: "bg-[#1E304A] border-slate-700 text-[#ABD1FF] hover: border-slate-500"
    },
    cards: "rounded-lg border bg-[#1E304A] border-[#0E1F37]",
}

export const gridColors = {
    background: "bg-[#2F3337]",
    border: "border-[#0E1F37]",
    gridLines: {
        vertical: {
            thick: "border-r-[#5B98E0]",
            thin: "border-r-[#435C78]"
        },
        horizontal: {
            thick: "border-b-[#5B98E0]",
            thin: "border-b-[#435C78]"
        }
    }
}

export const gridCells = {
    background: "bg-[#2F3337]",
    backgroundhover: "hover:bg-[#2A7CC3]",
    text: {
        given: {
            normal: "text-[#FFFFFF] font-bold text-2xl sm:text-3xl lg:text-4xl",
            error: "text-[#FFFFFF] font-bold text-2xl sm:text-3xl lg:text-4xl"
        },
        entered: {
            normal: "text-[#A6D6FF] font-semibold text-2xl sm:text-3xl lg:text-4xl",
            error: "text-[#A6D6FF] font-semibold text-2xl sm:text-3xl lg:text-4xl"
        },
        candidate: "text-[#FEFAFA]",
        candidateHighlighted: "text-amber-400 font-bold"
    },
    border: {
        selected: "border-[#2A7CC3]",
        notSelected: "border-[#2A7CC3]"
    },
    isSelected: {
        neighboor: "bg-[#2A7CC3]  hover:bg-[#2A7CC3]",
        error: "bg-[#7E608F] ring-2 ring-inset ring-[#2A7CC3]",
        focused: "bg-[#2A7CC3] ring-2 ring-inset ring-[#46A7FC]"
    },
    hasError: "bg-[#C03537]",
    sameDigitHighlighted: "bg-[#2B4563] ring-2 ring-inset ring-[#2A7CC3]",
    peerHighlighted: "bg-[#2B4563] hover:bg-[#2A7CC3]"
}