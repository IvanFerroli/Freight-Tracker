import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken =
  'pk.eyJ1IjoiaXZhbmZlcnJvbGkiLCJhIjoiY205MWdvdzM3MDByazJzb2RxNWM1aDByNiJ9.490tysNHeHNkTQWYjLhLsQ'

  export function MapViewMapbox() {
    const mapContainer = useRef<HTMLDivElement>(null)
  
    useEffect(() => {
      if (!mapContainer.current) return
  
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-45.9477, -19.1265],
        zoom: 13,
      })
  
      return () => map.remove()
    }, [])
  
    return <div ref={mapContainer} className="mapbox-container" />
  }
  