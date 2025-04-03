export interface Equipment {
    id: string
    name: string
    equipmentModelId: string
  }
  
  export interface Position {
    date: string
    lat: number
    lon: number
  }
  
  export interface EquipmentPositionHistory {
    equipmentId: string
    positions: Position[]
  }
  
  export interface EquipmentWithLatestPosition extends Equipment {
    position: Position
  }
  
  
  