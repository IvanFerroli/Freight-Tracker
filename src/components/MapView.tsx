import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbmZlcnJvbGkiLCJhIjoiY205MWdvdzM3MDByazJzb2RxNWM1aDByNiJ9.490tysNHeHNkTQWYjLhLsQ'

type PositionData = {
  name: string
  model: string
  date: string
  lat: number
  lng: number
  stateColor: string,
  stateName: string
  stateHistory?: { name: string; date: string }[]
}

type Props = {
  positions: PositionData[]
}

export function MapView({ positions }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: positions.length > 0 ? [positions[0].lng, positions[0].lat] : [-51.9253, -14.2350], // centro do Brasil

      zoom: 13,
    })

    positions.forEach((pos) => {
      new mapboxgl.Marker({ color: pos.stateColor })
        .setLngLat([pos.lng, pos.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <strong>${pos.name}</strong><br/>
            Modelo: ${pos.model}<br/>
            Data: ${pos.date}<br/>
            <span style="color:${pos.stateColor}">Estado: ${pos.stateName}</span><br/>
            ${
              pos.stateHistory?.length
                ? `<div style="max-height: 100px; overflow-y: auto; margin-top: 6px;">
                    <strong>Histórico:</strong><br/>
                    ${pos.stateHistory
                      .map(entry => `${entry.date} - ${entry.name}`)
                      .join('<br/>')}
                  </div>`
                : ''
            }
          `)
        )
        .addTo(map)
    })

    return () => map.remove()
  }, [positions])

  return <div ref={mapContainer} className="mapbox-container" />
}
