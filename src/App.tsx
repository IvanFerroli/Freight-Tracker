import './App.css'
import { useEffect, useState } from 'react'
import { MapView } from './components/MapView'
import {
  fetchEquipments,
  fetchPositionHistories,
  fetchEquipmentModels,
  getLatestPosition
} from './services/equipmentService'

type PositionData = {
  name: string
  model: string
  date: string
  lat: number
  lng: number
}

function App() {
  const [positions, setPositions] = useState<PositionData[]>([])

  useEffect(() => {
    async function loadData() {
      const [equipments, histories, models] = await Promise.all([
        fetchEquipments(),
        fetchPositionHistories(),
        fetchEquipmentModels()
      ])
    
      const result = equipments.map(equipment => {
        const position = getLatestPosition(equipment.id, histories)
        if (!position) return null

        const model = models.find(m => m.id === equipment.equipmentModelId)

        return {
          name: equipment.name,
          model: model?.name ?? 'Modelo desconhecido',
          date: position.date,
          lat: position.lat,
          lng: position.lon,
        }
      }).filter(Boolean) as PositionData[]

      setPositions(result)
    }

    loadData()
  }, [])

  return <MapView positions={positions} />
}

export default App
