interface Moment {
    event: string
    time: number
}

interface Highlight {
    roundNumber: number
    moments: Moment[]
    start: number
    duration: number
}

interface HighlightSpecification {
    demoFile: string
    highlights: Highlight[] 
}

export { Moment, Highlight, HighlightSpecification };