import { useQuery } from '@tanstack/react-query'
import type { Place, Result } from '../types'
import { fetchSky } from '../api/fetchSky'

export function useSky(place: Place | null, date: string) {
  return useQuery<Result[]>({
    queryKey: ['sky', place?.lat, place?.lon, date],
    enabled: place !== null,
    queryFn: async () => fetchSky({place: place!, date}),
  })
}
