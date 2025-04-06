import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbmZlcnJvbGkiLCJhIjoiY205MWdvdzM3MDByazJzb2RxNWM1aDByNiJ9.490tysNHeHNkTQWYjLhLsQ'

type PositionData = {
  name: string
  model: string
  date: string
  lat: number
  lng: number
  stateColor: string
  stateName: string
  stateHistory?: { name: string; date: string }[]
  path?: { lat: number; lon: number; date: string }[]
}

type Props = {
  positions: PositionData[]
  highlightName?: string | null
  showRoutes: boolean
}

const hourlyRates: Record<string, number> = {
  'Operando': 100,
  'Parado': 30,
  'Manutenção': 0,
}

function calculateProductivityAndEarnings(history: { name: string; date: string }[]) {
  const stateNameMap: Record<string, string> = {
    operando: 'Operando',
    parado: 'Parado',
    manutencao: 'Manutenção',
  }

  const sorted = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const durations: Record<string, number> = {}

  for (let i = 0; i < sorted.length - 1; i++) {
    const start = new Date(sorted[i].date)
    const end = new Date(sorted[i + 1].date)
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    const rawName = sorted[i].name
    const name = stateNameMap[rawName.toLowerCase()] || rawName

    if (name && !isNaN(diffHours)) {
      durations[name] = (durations[name] || 0) + diffHours
    }
  }

  const total = Object.values(durations).reduce((a, b) => a + b, 0)
  const operando = durations['Operando'] || 0
  const productivity = total > 0 ? Math.round((operando / total) * 100) : 0

  let ganho = 0
  for (const [state, hours] of Object.entries(durations)) {
    const rate = typeof hourlyRates[state] === 'number' ? hourlyRates[state] : 0
    ganho += rate * hours
  }

  return { productivity, ganho }
}

export function MapView({ positions, highlightName, showRoutes }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: positions.length > 0 ? [positions[0].lng, positions[0].lat] : [-51.9253, -14.2350],
      zoom: 13,
    })

    map.on('load', () => {
      positions.forEach((pos, idx) => {
        const formattedDate = new Date(pos.date).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        const { productivity, ganho } = pos.stateHistory?.length
          ? calculateProductivityAndEarnings(pos.stateHistory)
          : { productivity: 0, ganho: 0 }

        const historyTitle = pos.stateHistory?.length ? `<strong>Histórico:</strong><br/>` : ''
        const historyHTML = pos.stateHistory?.length
          ? `<div style="max-height: 100px; overflow-y: auto; margin-top: 6px;">
              ${pos.stateHistory
                .map(entry => {
                  const formatted = new Date(entry.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  return `${formatted} - ${entry.name}`
                })
                .join('<br/>')}
            </div>`
          : ''

        const extraInfo = `
          <br/><strong>Produtividade:</strong> ${productivity}%<br/>
          <strong>Ganho estimado:</strong> ${ganho.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
<br/>
        `

        new mapboxgl.Marker({
          color: highlightName === pos.name ? '#000000' : pos.stateColor
        })
          .setLngLat([pos.lng, pos.lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <strong>${pos.name}</strong><br/>
              Modelo: ${pos.model}<br/>
              Data: ${formattedDate}<br/>
              <span style="color:${pos.stateColor}">Estado: ${pos.stateName}</span><br/>
              ${extraInfo}
              ${historyTitle}
              ${historyHTML}
            `)
          )
          .addTo(map)

        if (highlightName === pos.name) {
          map.flyTo({ center: [pos.lng, pos.lat], zoom: 15 })
        }

        if (showRoutes && pos.path && pos.path.length > 1) {
          const coordinates = pos.path.map(p => [p.lon, p.lat])

          map.addSource(`route-${idx}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates
              },
              properties: {}
            }
          })

          map.addLayer({
            id: `route-${idx}`,
            type: 'line',
            source: `route-${idx}`,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#0074D9',
              'line-width': 3
            }
          })
        }
      })
    })

    return () => map.remove()
  }, [positions, highlightName, showRoutes])

  return <div ref={mapContainer} className="mapbox-container" />
}
