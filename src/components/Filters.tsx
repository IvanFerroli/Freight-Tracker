import { ChangeEvent } from 'react'
import { PositionData, FiltersState } from '../App'

type Props = {
  positions: PositionData[]
  filters: FiltersState
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>
}

export function Filters({ positions, filters, setFilters }: Props) {
  const models = Array.from(new Set(positions.map((p) => p.model)))
  const states = Array.from(new Set(positions.map((p) => p.stateName)))

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="filters" style={{ margin: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <label>
        Modelo:&nbsp;
        <select name="model" value={filters.model} onChange={handleChange}>
          <option value="Todos">Todos</option>
          {models.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </label>

      <label>
        Estado:&nbsp;
        <select name="state" value={filters.state} onChange={handleChange}>
          <option value="Todos">Todos</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </label>

      <label>
        Nome:&nbsp;
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleChange}
          placeholder="Pesquisar por nome..."
        />
      </label>
    </div>
  )
}
