import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'


mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbmZlcnJvbGkiLCJhIjoiY205MWdvdzM3MDByazJzb2RxNWM1aDByNiJ9.490tysNHeHNkTQWYjLhLsQ'

type Props = {
    position: {
      name: string
      lat: number
      lng: number
    }
  }
  

export function MapView({ position }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [position.lng, position.lat],
      zoom: 13,
    })

    new mapboxgl.Marker()
      .setLngLat([position.lng, position.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${position.name}</h3>`))
      .addTo(map)

    return () => map.remove()
  }, [position])

  return <div ref={mapContainer} className="mapbox-container" />
}
