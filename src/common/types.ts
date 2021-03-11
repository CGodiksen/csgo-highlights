interface Moment {
    event: string;
    time: number;
}

// TODO: Add an ID to handle when there is more than one highlight from a single round.
interface Highlight {
    roundNumber: number;
    moments: Moment[];
    start: number;
    duration: number;
}

interface HighlightSpecification {
    demoFile: string;
    highlights: Highlight[]; 
    vodFilePath?: string;
}

export { Moment, Highlight, HighlightSpecification };