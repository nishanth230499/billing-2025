'use server'

import { headers } from 'next/headers'

export default async function getLoggedinUserId() {
  return (await headers()).get('x-loggedin-user-id')
}
