import './App.css'
import { MapView } from './components/MapView'
import { EquipmentPosition } from './types/equipment'

function App() {
  const mockPosition: EquipmentPosition = {
    name: 'Mocked Equipment',
    lat: -19.1265,
    lng: -45.9477
  }

  return <MapView position={mockPosition} />
}

export default App
