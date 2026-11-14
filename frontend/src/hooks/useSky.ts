import { useQuery } from '@tanstack/react-query'
import { fetchSky } from '../api/fetchSky'
import type { Place } from '../types'

export function useSky(place: Place | null, date: string) {
  return useQuery({
    queryKey: ['sky', place, date],
    queryFn: () => fetchSky(place!, date),
    enabled: !!place,
  })
}
