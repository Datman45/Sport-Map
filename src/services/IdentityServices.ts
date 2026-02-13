import type { IResultObject } from '@/types/IResultObject'
import { BaseService } from './BaseService'
import type { AuthenticationDto } from '@/types/AuthenticationDto'

export abstract class IdentityService extends BaseService {
  static async login(email: string, password: string): Promise<IResultObject<AuthenticationDto>> {
    const url = 'account/login'

    try {
      const loginData = {
        email,
        password,
      }
      const response = await this.axios.post<AuthenticationDto>(url, loginData)

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

  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<IResultObject<AuthenticationDto>> {
    const url = 'Account/Register'

    try {
      const registerData = {
        email,
        firstName,
        lastName,
        password,
      }

      const response = await this.axios.post<AuthenticationDto>(url, registerData)

      console.log('register response', response)

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
