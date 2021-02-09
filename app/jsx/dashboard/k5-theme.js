/*
 * Copyright (C) 2020 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {Heading} from '@instructure/ui-heading'
import {Tabs} from '@instructure/ui-tabs'
import canvas from '@instructure/canvas-theme'

const {
  variables: {typography}
} = canvas

/**
 * These are the base defaults used to generate component-specific theme
 * variables in InstUI. For instance, setting the `fontFamily` here will be
 * used as the `fontFamily` value in the `Text` component as well as the
 * `h1FontFamily` value in the `Heading` component.
 */
const base = {
  typography: {
    fontFamily: `"Balsamiq Sans", ${typography.fontFamily}`
  }
}

/**
 * These are component-specific overrides that only apply to specific InstUI
 * elements. If a component has a separate theme variable that is based off
 * of the default variables or if you only want to change the theme for a
 * single component, it needs to be defined here.
 */
export const theme = {
  [Heading.theme]: {
    h1FontWeight: typography.fontWeightBold,
    h2FontSize: '1.5rem',
    h2FontWeight: typography.fontWeightBold,
    h3FontSize: '1.25rem',
    h3FontWeight: typography.fontWeightBold
  },
  [Tabs.Tab.theme]: {
    fontSize: '1.25rem'
  }
}

export default {
  use: () => canvas.use({overrides: base})
}
