import { gql, useQuery } from '@apollo/client'
import { Plural, Trans } from '@lingui/macro'
import classnames from 'classnames'
import * as React from 'react'
import { useNavigate } from 'react-router'

import ModelCard from '../components/ModelCard'
import { Button } from '../components/views/Button'
import { Body1, Headline1 } from '../components/views/Typography'
import type { ModelsQuery } from './__generated__/ModelsQuery'

export const MODELS_QUERY = gql`
  query ModelsQuery {
    models {
      id
      name
      templates {
        id
        name
      }
      fields {
        id
        name
      }
    }
  }
`

const ModelsSection: React.FunctionComponent = () => {
  const navigate = useNavigate()

  const handleAddClick = () => {
    navigate('/models/create')
  }

  const { data: { models = [] } = {}, loading } =
    useQuery<ModelsQuery>(MODELS_QUERY)

  if (loading) {
    return (
      <div className="py-4">
        <span className="text-txt text-opacity-text-primary">
          <Trans>Loading models</Trans>
        </span>
      </div>
    )
  }

  return (
    <>
      <Headline1 className="mt-6 leading-none text-txt text-opacity-text-primary">
        <Trans>Your models</Trans>
      </Headline1>

      <div className="flex items-center mt-6">
        {models.length > 0 && (
          <Body1 className="text-txt text-opacity-text-secondary font-medium">
            <Plural
              value={models.length}
              zero="# models"
              one="# model"
              other="# models"
            />
          </Body1>
        )}
        <Button
          className={classnames({ 'ml-6': models.length > 0 })}
          onClick={handleAddClick}
        >
          <Trans>Create model</Trans>
        </Button>
      </div>

      {models.length === 0 ? (
        <Body1 className="mt-8 text-txt text-opacity-text-primary">
          <Trans>You haven't created any models yet</Trans>
        </Body1>
      ) : (
        <div className="flex flex-col mt-6 mb-4">
          {models.map((model) => (
            <div key={model.id} className="mb-4">
              <ModelCard {...model} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default ModelsSection
