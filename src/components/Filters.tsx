import { ChangeEvent, useState } from 'react'
import { FiltersState } from '../App'
import '../styles/filters.css'

type Props = {
  models: string[]
  states: string[]
  names: string[]
  filters: FiltersState
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>
}

export function Filters({ models, states, filters, names, setFilters }: Props) {
  const [focused, setFocused] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const highlightMatch = (name: string) => {
    const input = filters.name.toLowerCase()
    const index = name.toLowerCase().indexOf(input)
    if (index === -1) return name

    return (
      <>
        {name.slice(0, index)}
        <strong>{name.slice(index, index + input.length)}</strong>
        {name.slice(index + input.length)}
      </>
    )
  }

  const filteredSuggestions = filters.name.length > 0
    ? names.filter(n => n.toLowerCase().includes(filters.name.toLowerCase()))
    : []

  return (
    <div className="filters-container">
      <label>
        Modelo:&nbsp;
        <select
          name="model"
          value={filters.model}
          onChange={handleChange}
          title="Filtra os equipamentos pelo modelo"
        >
          <option value="Todos">Todos</option>
          {models.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </label>

      <label>
        Estado:&nbsp;
        <select
          name="state"
          value={filters.state}
          onChange={handleChange}
          title="Filtra os equipamentos pelo estado atual"
        >
          <option value="Todos">Todos</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </label>

      <label className="name-input-wrapper">
        Nome:&nbsp;
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleChange}
          placeholder="ex: GT-2003"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          title="Pesquise pelo nome do equipamento (ex: GT-2003)"
        />
        {focused && filteredSuggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {filteredSuggestions.map(name => (
              <li
                key={name}
                className="suggestion-item"
                onMouseDown={() =>
                  setFilters(prev => ({ ...prev, name }))
                }
              >
                {highlightMatch(name)}
              </li>
            ))}
          </ul>
        )}
      </label>
    </div>
  )
}
