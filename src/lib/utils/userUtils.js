import { UserType } from '@/models/User'

export function isAdmin(user) {
  return user.type === UserType.ADMIN || user.type === UserType.SUPER_ADMIN
}
