export const useTime = () => {
    let durationRecorder: number | null = null // records milliseconds

    function start() {
        durationRecorder = Date.now()
    }

    /**
     * Stops and returns result in seconds
     * */
    function stop(): number {
        if (!durationRecorder) {
            throw new Error("duration recorder not set")
        }
        const endMillis = Date.now()
        const durationInMillis = endMillis - durationRecorder

        return Math.ceil(durationInMillis / 1000)
    }

    return {start, stop}
}