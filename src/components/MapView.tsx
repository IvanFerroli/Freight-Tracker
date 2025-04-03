import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbmZlcnJvbGkiLCJhIjoiY205MWdvdzM3MDByazJzb2RxNWM1aDByNiJ9.490tysNHeHNkTQWYjLhLsQ'

type PositionData = {
  name: string
  model: string
  date: string
  lat: number
  lng: number
}

type Props = {
  positions: PositionData[]
}

export function MapView({ positions }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainer.current || positions.length === 0) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [positions[0].lng, positions[0].lat],
      zoom: 13,
    })

    positions.forEach((pos) => {
      new mapboxgl.Marker()
        .setLngLat([pos.lng, pos.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <strong>${pos.name}</strong><br/>
            Modelo: ${pos.model}<br/>
            Data: ${pos.date}
          `)
        )
        .addTo(map)
    })

    return () => map.remove()
  }, [positions])

  return <div ref={mapContainer} className="mapbox-container" />
}
