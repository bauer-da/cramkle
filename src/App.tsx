import { ApolloProvider } from '@apollo/react-hooks'
import { Routes } from '@casterly/components'
import { I18nProvider } from '@lingui/react'
import { ErrorBoundary } from '@sentry/react'
import { FC, StrictMode } from 'react'
import { Helmet } from 'react-helmet'

import CramkleToasts from './components/CramkleToasts'
import { HintsProvider } from './components/HintsContext'
import { ThemeProvider } from './components/Theme'
import { errorFallback } from './utils/errorFallback'

import 'fontsource-libre-franklin/latin-300.css'
import 'fontsource-libre-franklin/latin-400.css'
import 'fontsource-libre-franklin/latin-500.css'
import 'fontsource-libre-franklin/latin-600.css'
import './material.global.scss'
import './app.global.scss'
import './_tailwind.global.css'

const App: FC<{ i18n: any; apolloClient: any; userAgent: string }> = ({
  i18n,
  apolloClient,
  userAgent,
}) => {
  return (
    <StrictMode>
      <I18nProvider i18n={i18n}>
        <ApolloProvider client={apolloClient}>
          <HintsProvider userAgent={userAgent}>
            <Helmet
              defaultTitle="Cramkle"
              titleTemplate="%s - Cramkle"
              meta={[
                {
                  name: 'application-name',
                  content: 'Cramkle',
                },
                {
                  name: 'description',
                  content:
                    'Cramkle helps you boost your knowledge rentention with an ' +
                    'effective flashcard-based studying method, and SRS algorithm.',
                },
                {
                  name: 'keywords',
                  content: 'flashcards,anki,srs,spaced repetition',
                },
                {
                  name: 'theme-color',
                  content: '#ffffff',
                },
              ]}
            />
            <ErrorBoundary fallback={errorFallback}>
              <ThemeProvider>
                <CramkleToasts />
                <Routes />
              </ThemeProvider>
            </ErrorBoundary>
          </HintsProvider>
        </ApolloProvider>
      </I18nProvider>
    </StrictMode>
  )
}

export default App
