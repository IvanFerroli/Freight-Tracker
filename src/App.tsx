import './App.css'
import { useEffect, useState } from 'react'
import { MapView } from './components/MapView'
import { EquipmentWithLatestPosition } from './types/equipment'
import { fetchEquipments, fetchPositionHistories } from './services/equipmentService'
import { getLatestPosition } from './services/equipmentService'


function App() {
  const [equipments, setEquipments] = useState<EquipmentWithLatestPosition[]>([])

  useEffect(() => {
    async function loadData() {
      const [equipments, histories] = await Promise.all([
        fetchEquipments(),
        fetchPositionHistories()
      ])

      const withPositions = equipments.map(equipment => {
        const position = getLatestPosition(equipment.id, histories)

        if (!position) return null
      
        return {
          id: equipment.id,
          name: equipment.name,
          equipmentModelId: equipment.equipmentModelId,
          position, // já é { lat, lon, date }
        }
      }).filter(Boolean) as EquipmentWithLatestPosition[]
      

      setEquipments(withPositions)
    }

    loadData()
  }, [])

  return (
    <>
      {equipments.map((equipment) => (
        <MapView
        key={equipment.id}
        position={{
          name: equipment.name,
          lat: equipment.position.lat,
          lng: equipment.position.lon,
        }}
      />
      ))}
    </>
  )
}

export default App
