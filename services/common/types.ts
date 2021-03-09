interface Moment {
    event: string
    time: number
}

interface Highlight {
    roundNumber: number
    moments: Moment[]
    start: number
    end: number
}

export { Moment, Highlight };