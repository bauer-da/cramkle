import { Trans } from '@lingui/macro'
import classnames from 'classnames'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

import { MarketplaceIcon } from './icons/MarketplaceIcon'
import { ProfileIcon } from './icons/ProfileIcon'
import { SettingsIcon } from './icons/SettingsIcon'
import { StatisticsIcon } from './icons/StatisticsIcon'
import { Chip } from './views/Chip'
import { List, ListItem } from './views/List'

const HomePageSidebar: FC<{ className?: string }> = ({ className }) => {
  return (
    <nav className={classnames(className, 'w-full px-8 py-6 max-w-xs')}>
      <List>
        <ListItem as={Link} to="/statistics" icon={<StatisticsIcon />}>
          <Trans>Statistics</Trans>
        </ListItem>
        <ListItem as={Link} icon={<SettingsIcon />} to="/settings/preferences">
          <Trans>Settings</Trans>
        </ListItem>
        <ListItem as={Link} to="/settings/profile" icon={<ProfileIcon />}>
          <Trans>Profile</Trans>
        </ListItem>
        <ListItem as={Link} to="/marketplace" icon={<MarketplaceIcon />}>
          <div className="flex items-center">
            <Trans>Marketplace</Trans>

            <Chip size="small" color="primary" className="ml-auto">
              <Trans>new</Trans>
            </Chip>
          </div>
        </ListItem>
      </List>

      <footer className="max-w-xs mx-auto mt-10 px-8 flex justify-between items-center text-txt text-opacity-text-secondary text-xs">
        <a href="https://bauer-ec.de" target="_blank" rel="noreferrer">
          Bauer DeutschAkademie
        </a>
      </footer> */}
    </nav>
  )
}

export default HomePageSidebar
