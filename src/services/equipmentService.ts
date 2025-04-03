import { Equipment, EquipmentPositionHistory } from '../types/equipment'

export async function fetchEquipments(): Promise<Equipment[]> {
  const res = await fetch('/data/equipment.json')
  return res.json()
}

export async function fetchPositionHistories(): Promise<EquipmentPositionHistory[]> {
  const res = await fetch('/data/equipmentPositionHistory.json')
  return res.json()
}

export function getLatestPosition(
    equipmentId: string,
    histories: EquipmentPositionHistory[]
  ) {
    const history = histories.find((h) => h.equipmentId === equipmentId)
    return history?.positions.at(-1) ?? null
  }
  