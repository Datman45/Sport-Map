import type { IGpsSession } from '@/types/domain/IGpsSession'
import { BaseEntityService } from './EntityService'

export class GpsSessionService extends BaseEntityService<IGpsSession> {
  constructor() {
    super('GpsSessions')
  }
}
