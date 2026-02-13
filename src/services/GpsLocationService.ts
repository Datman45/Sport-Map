import type { IGpsLocation } from '@/types/domain/IGpsLocation'
import { BaseEntityService } from './EntityService'

export class GpsLocationService extends BaseEntityService<IGpsLocation> {
  constructor() {
    super('GpsLocations')
  }
}
