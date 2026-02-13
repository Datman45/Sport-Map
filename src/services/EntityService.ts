import type { IResultObject } from '@/types/IResultObject'
import { BaseService } from './BaseService'
import { useUserDataStore } from '@/stores/userDataStore'

export abstract class BaseEntityService<TEntity> extends BaseService {
  store = useUserDataStore()
  constructor(private basePath: string) {
    super()
  }

  async getAllAsync(params?: Record<string, unknown>): Promise<IResultObject<TEntity[]>> {
    const url = this.basePath
    try {
      const response = await BaseService.axios.get<TEntity[]>(url, { params })

      console.log('getAll response', response)

      if (response.status <= 300) {
        return { data: response.data }
      }

      return {
        errors: [(response.status.toString() + ' ' + response.statusText).trim()],
      }
    } catch (error) {
      console.log('error: ', (error as Error).message)
      return { errors: [JSON.stringify(error)] }
    }
  }

  async getByIdAsync(id: string): Promise<IResultObject<TEntity>> {
    const url = this.basePath + '/' + id
    console.log('getByIdAsync url: ', url)
    try {
      const response = await BaseService.axios.get<TEntity>(url)

      if (response.status <= 300) {
        return { data: response.data }
      }

      return {
        errors: [(response.status.toString() + ' ' + response.statusText).trim()],
      }
    } catch (error) {
      console.log('error: ', (error as Error).message)
      return { errors: [JSON.stringify(error)] }
    }
  }

  async addAsync(entity: TEntity, id?: string): Promise<IResultObject<TEntity>> {
    let requestPath = this.basePath
    if (id) {
      requestPath = this.basePath + '/' + id
    }

    try {
      let options = {}
      if (this.store.jwt) {
        options = {
          headers: {
            Authorization: `Bearer ${this.store.jwt}`,
          },
        }
      }

      const response = await BaseService.axios.post<TEntity>(requestPath, entity, options)

      console.log('login response', response)

      if (response.status <= 300) {
        return { data: response.data }
      }

      return {
        errors: [(response.status.toString() + ' ' + response.statusText).trim()],
      }
    } catch (error) {
      console.log('error: ', (error as Error).message)
      return { errors: [JSON.stringify(error)] }
    }
  }

  async deleteAsync(id: string): Promise<IResultObject<TEntity>> {
    try {
      let options = {}
      if (this.store.jwt) {
        options = {
          headers: {
            Authorization: `Bearer ${this.store.jwt}`,
          },
        }
      }

      const response = await BaseService.axios.delete<TEntity>(this.basePath + '/' + id, options)

      console.log('login response', response)

      if (response.status <= 300) {
        return { data: response.data }
      }

      return {
        errors: [(response.status.toString() + ' ' + response.statusText).trim()],
      }
    } catch (error) {
      console.log('error: ', (error as Error).message)
      return { errors: [JSON.stringify(error)] }
    }
  }

  async updateAsync(id: string, entity: TEntity): Promise<IResultObject<TEntity>> {
    try {
      let options = {}
      if (this.store.jwt) {
        options = {
          headers: {
            Authorization: `Bearer ${this.store.jwt}`,
          },
        }
      }

      const response = await BaseService.axios.put<TEntity>(
        this.basePath + '/' + id,
        entity,
        options,
      )

      console.log('login response', response)

      if (response.status <= 300) {
        return { data: response.data }
      }

      return {
        errors: [(response.status.toString() + ' ' + response.statusText).trim()],
      }
    } catch (error) {
      console.log('error: ', (error as Error).message)
      return { errors: [JSON.stringify(error)] }
    }
  }
}
