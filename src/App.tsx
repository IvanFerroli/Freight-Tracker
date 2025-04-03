import './App.css'
import { useEffect, useState } from 'react'
import { MapView } from './components/MapView'
import { EquipmentWithLatestPosition } from './types/equipment'
import {
  fetchEquipments,
  fetchPositionHistories,
  fetchEquipmentModels,
  getLatestPosition
} from './services/equipmentService'





function App() {
  const [equipments, setEquipments] = useState<EquipmentWithLatestPosition[]>([])

  useEffect(() => {
    async function loadData() {
      const [equipments, histories, models] = await Promise.all([
        fetchEquipments(),
        fetchPositionHistories(),
        fetchEquipmentModels()
      ])
    
      const withPositions = equipments.map(equipment => {
        const position = getLatestPosition(equipment.id, histories)
        if (!position) return null
    
        const model = models.find(m => m.id === equipment.equipmentModelId)
    
        return {
          id: equipment.id,
          name: equipment.name,
          equipmentModelId: equipment.equipmentModelId,
          position,
          modelName: model?.name ?? 'Modelo desconhecido'
        }
      }).filter(Boolean) as (EquipmentWithLatestPosition & { modelName: string })[]
    
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
          model: equipment.modelName,
          date: equipment.position.date,
          lat: equipment.position.lat,
          lng: equipment.position.lon,
        }}
        
      />
      ))}
    </>
  )
}

export default App
