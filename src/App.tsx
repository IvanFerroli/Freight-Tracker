import './App.css'
import { useEffect, useState } from 'react'
import { MapView } from './components/MapView'
import {
  fetchEquipments,
  fetchPositionHistories,
  fetchEquipmentModels,
  getLatestPosition,
  fetchEquipmentStates,
  fetchEquipmentStateHistories,
  getLatestState
} from './services/equipmentService'

type PositionData = {
  name: string
  model: string
  date: string
  lat: number
  lng: number
  stateColor: string
  stateName: string
}

function App() {
  const [positions, setPositions] = useState<PositionData[]>([])

  useEffect(() => {
    async function loadData() {
      const [equipments, histories, models, states, stateHistories] = await Promise.all([
        fetchEquipments(),
        fetchPositionHistories(),
        fetchEquipmentModels(),
        fetchEquipmentStates(),
        fetchEquipmentStateHistories(),
      ])

      const result = equipments.map(equipment => {
        const position = getLatestPosition(equipment.id, histories)
        if (!position) return null

        const model = models.find(m => m.id === equipment.equipmentModelId)
        const state = getLatestState(equipment.id, stateHistories, states)

        const stateName = state?.name ?? 'Estado desconhecido'
        const stateColor = state?.color ?? '#e74c3c'

        let displayStateName = stateName
        if (stateColor === '#2ecc71') {
          displayStateName = 'Operando'
        } else if (stateColor === '#f1c40f') {
          displayStateName = 'Parado'
        } else if (stateColor === '#e74c3c') {
          displayStateName = 'Manutenção'
        } else {
          displayStateName = 'Estado Desconhecido'
        }

        return {
          name: equipment.name,
          model: model?.name ?? 'Modelo desconhecido',
          date: position.date,
          lat: position.lat,
          lng: position.lon,
          stateName: displayStateName,
          stateColor: stateColor,
        }
      }).filter(Boolean) as PositionData[]

      setPositions(result)
    }

    loadData()
  }, [])

  return <MapView positions={positions} />
}

export default App
