export type Place = { lat: number; lon: number; name: string, tz: string,}

export type SkyQuery = { place: Place; date: string }

export type Result = {
	name: string
	score: number
	peak_alt: number
	azimuth: number
	best_time: string
}
