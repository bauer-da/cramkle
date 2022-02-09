import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import * as React from 'react'
import { Helmet } from 'react-helmet-async'

import { LogoCircle } from '../components/LogoCircle'
import LoginForm from '../components/forms/LoginForm'
import { Card, CardContent } from '../components/views/Card'

const LoginPage: React.FunctionComponent = () => {
  const { i18n } = useLingui()

  return (
    <div className="flex flex-col min-h-screen w-full p-4 items-center justify-center bg-primary-dark text-on-primary">
      <Helmet>
        <title>{i18n._(t`Login`)}</title>
        <meta
          name="description"
          content={i18n._(t`Login to your account to study your decks`)}
        />
      </Helmet>

      <LogoCircle className="w-16 mb-8" />

      <Card className="w-full max-w-md">
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
