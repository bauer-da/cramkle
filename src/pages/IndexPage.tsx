import { useQuery } from '@apollo/client'
import { Suspense, lazy } from 'react'

import Shell from '../components/Shell'
import { UserContext } from '../components/UserContext'
import type { UserQuery } from '../components/__generated__/UserQuery'
import USER_QUERY from '../components/userQuery.gql'
import LoginPage from './LoginPage'

const HomePage = lazy(() => import('./HomePage'))

export default function IndexPage() {
  const { data, loading } = useQuery<UserQuery>(USER_QUERY, {
    errorPolicy: 'ignore',
  })

  if (loading) {
    return 'Loading...'
  }

  let content = null

  if (data?.me != null) {
    content = (
      <Suspense fallback="loading">
        <Shell>
          <HomePage />
        </Shell>
      </Suspense>
    )
  } else {
    content = (
      <Suspense fallback="loading">
        <LoginPage />
      </Suspense>
    )
  }

  return <UserContext user={data?.me ?? undefined}>{content}</UserContext>
}
