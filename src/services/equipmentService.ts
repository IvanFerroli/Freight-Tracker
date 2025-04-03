import { Equipment, EquipmentPositionHistory } from '../types/equipment'

export async function fetchEquipments(): Promise<Equipment[]> {
  const res = await fetch('/data/equipment.json')
  return res.json()
}

export async function fetchPositionHistory(): Promise<EquipmentPositionHistory[]> {
  const res = await fetch('/data/equipmentPositionHistory.json')
  return res.json()
}
