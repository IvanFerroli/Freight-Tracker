import './App.css'
import { useEffect, useState } from 'react'
import { MapView } from './components/MapView'
import { Filters } from './components/Filters'
import filterIcon from './assets/img/filter.png'
import {
  fetchEquipments,
  fetchPositionHistories,
  fetchEquipmentModels,
  getLatestPosition,
  fetchEquipmentStates,
  fetchEquipmentStateHistories,
  getLatestState
} from './services/equipmentService'

export type PositionData = {
  name: string
  model: string
  date: string
  lat: number
  lng: number
  stateColor: string
  stateName: string
  stateHistory?: { name: string; date: string }[]
  productivity?: number
  estimatedEarnings?: number
}

export type FiltersState = {
  model: string
  state: string
  name: string
  modelText: string
}

function App() {
  const [showFilters, setShowFilters] = useState(true)
  const [positions, setPositions] = useState<PositionData[]>([])
  const [filters, setFilters] = useState<FiltersState>(() => {
    const saved = localStorage.getItem('filters')
    return saved
      ? JSON.parse(saved)
      : { model: 'Todos', state: 'Todos', name: '', modelText: '' }
  })
  const [highlightName, setHighlightName] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('filters', JSON.stringify(filters))
  }, [filters])

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

        const equipmentStateHistory = stateHistories.find(h => h.equipmentId === equipment.id)
        const fullStateHistory = equipmentStateHistory?.states.map(entry => {
          const s = states.find(state => state.id === entry.equipmentStateId)
          return {
            name: s?.name ?? 'Estado desconhecido',
            date: entry.date,
          }
        }) ?? []

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

        let totalHoras = 0
        let horasOperando = 0
        let ganhoEstimado = 0

        if (fullStateHistory.length >= 2) {
          for (let i = 0; i < fullStateHistory.length - 1; i++) {
            const atual = new Date(fullStateHistory[i].date)
            const proxima = new Date(fullStateHistory[i + 1].date)
            const horas = (proxima.getTime() - atual.getTime()) / 1000 / 60 / 60
            totalHoras += horas

            if (fullStateHistory[i].name === 'Operando') {
              horasOperando += horas
              ganhoEstimado += horas * 100
            } else if (fullStateHistory[i].name === 'Parado') {
              ganhoEstimado += horas * 30
            }
          }
        }

        const produtividade = totalHoras > 0 ? (horasOperando / totalHoras) * 100 : 0

        const formattedHistory = fullStateHistory.map(entry => ({
          name: entry.name,
          date: new Date(entry.date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))

        return {
          name: equipment.name,
          model: model?.name ?? 'Modelo desconhecido',
          date: position.date,
          lat: position.lat,
          lng: position.lon,
          stateName: displayStateName,
          stateColor: stateColor,
          stateHistory: formattedHistory,
          productivity: Math.round(produtividade),
          estimatedEarnings: Math.round(ganhoEstimado)
        }
      }).filter(Boolean) as PositionData[]

      setPositions(result)
    }

    loadData()
  }, [])

  const filtered = positions.filter((pos) => {
    const matchesModel = filters.model === 'Todos' || pos.model === filters.model
    const matchesModelText = pos.model.toLowerCase().includes(filters.modelText.toLowerCase())
    const matchesState = filters.state === 'Todos' || pos.stateName === filters.state
    const matchesName = pos.name.toLowerCase().includes(filters.name.toLowerCase())
    return matchesModel && matchesModelText && matchesState && matchesName
  })

  useEffect(() => {
    if (filters.name.trim().length > 0 && filtered.length === 1) {
      setHighlightName(filtered[0].name)
    } else {
      setHighlightName(null)
    }
  }, [filters.name, filtered])

  return (
    <>
      {positions.length === 0 ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          {/* Ícone toggle de filtros */}
          <img
            src={filterIcon}
            alt="Toggle filtros"
            className="filter-icon-toggle"
            onClick={() => setShowFilters(prev => !prev)}
          />

          {/* Componente de Filtros (condicional) */}
          <Filters
            models={Array.from(new Set(positions.map((p) => p.model)))}
            states={['Operando', 'Parado', 'Manutenção']}
            filters={filters}
            setFilters={setFilters}
            names={Array.from(new Set(positions.map((p) => p.name)))}
            show={showFilters}
          />

          {/* Mapa */}
          <MapView positions={filtered} highlightName={highlightName} />
        </>
      )}
    </>
  )
}

export default App
