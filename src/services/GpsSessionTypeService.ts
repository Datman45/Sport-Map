import type { IGpsSessionType } from '@/types/domain/IGpsSessionType'
import { BaseEntityService } from './EntityService'

export class GpsSessionTypeService extends BaseEntityService<IGpsSessionType> {
  constructor() {
    super('GpsSessionTypes')
  }
}
