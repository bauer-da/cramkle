import { ApolloProvider } from '@apollo/client'
import { Routes } from '@casterly/components'
import { I18nProvider } from '@lingui/react'
import { ErrorBoundary } from '@sentry/react'
import font400normal from 'fontsource-libre-franklin/files/libre-franklin-latin-400-normal.woff2'
import font500normal from 'fontsource-libre-franklin/files/libre-franklin-latin-500-normal.woff2'
import type { FC } from 'react'
import { Suspense } from 'react'
import { Helmet } from 'react-helmet-async'

import CramkleToasts from './components/CramkleToasts'
import { HintsProvider } from './components/HintsContext'
import { ThemeProvider } from './components/Theme'
import { errorFallback } from './utils/errorFallback'

import 'fontsource-libre-franklin/latin.css'
import './material.scss'
import './app.scss'
import './tailwind.scss'

const App: FC<{
  i18n: any
  apolloClient: any
  userAgent: string
  userPreferredTheme: Theme
}> = ({ i18n, apolloClient, userAgent, userPreferredTheme }) => {
  return (
    <>
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
              link={[font400normal, font500normal].map((fontSrc) => ({
                href: fontSrc,
                rel: 'preload',
                as: 'font',
                type: 'font/woff2',
                crossOrigin: 'anonymous',
              }))}
            />
            <ErrorBoundary fallback={errorFallback}>
              <ThemeProvider userPreferredTheme={userPreferredTheme}>
                <Suspense
                  fallback={
                    <div
                      className="h-full w-full flex items-center justify-center bg-background bg-opacity-background"
                      aria-busy="true"
                    >
                      <p className="text-txt text-opacity-text-primary">
                        Loading...
                      </p>
                    </div>
                  }
                >
                  <CramkleToasts />
                  <Routes />
                </Suspense>
              </ThemeProvider>
            </ErrorBoundary>
          </HintsProvider>
        </ApolloProvider>
      </I18nProvider>
    </>
  )
}

export default App
