/*
 * Copyright (C) 2018 - present Instructure, Inc.
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

import {MockedProvider} from '@apollo/react-testing'
import {act, render as rtlRender, fireEvent} from '@testing-library/react'
import {within} from '@testing-library/dom'
import React from 'react'
import {createCache} from '@canvas/apollo'
import OutcomeManagementPanel from '../index'
import OutcomesContext from '@canvas/outcomes/react/contexts/OutcomesContext'
import {
  accountMocks,
  courseMocks,
  groupDetailMocks,
  groupMocks
} from '@canvas/outcomes/mocks/Management'
import * as api from '@canvas/outcomes/graphql/Management'
import * as FlashAlert from '@canvas/alerts/react/FlashAlert'
import startMoveOutcome from '@canvas/outcomes/react/helpers/startMoveOutcome'

jest.mock('@canvas/rce/RichContentEditor')
jest.mock('@canvas/outcomes/react/helpers/startMoveOutcome')
jest.useFakeTimers()

describe('OutcomeManagementPanel', () => {
  let cache
  let showFlashAlertSpy
  const outcome = {
    __typename: 'LearningOutcome',
    _id: '1',
    canEdit: true,
    contextId: '2',
    contextType: 'Course',
    description: '',
    displayName: '',
    friendlyDescription: null,
    title: 'Outcome 1 - Group 200'
  }
  const newParentGroup = {
    canEdit: true,
    collections: [200, 201],
    descriptor: '2 Groups | 2 Outcomes',
    id: 2,
    loadInfo: 'loaded',
    name: 'Root course folder',
    outcomesCount: 2,
    parentGroupId: 0
  }

  beforeEach(() => {
    cache = createCache()
    showFlashAlertSpy = jest.spyOn(FlashAlert, 'showFlashAlert')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const groupDetailDefaultProps = {
    contextType: 'Course',
    contextId: '2',
    mocks: [
      ...courseMocks({childGroupsCount: 2}),
      ...groupMocks({groupId: 200}),
      ...groupDetailMocks({groupId: 200, contextType: 'Course', contextId: '2'})
    ]
  }

  const render = (
    children,
    {contextType = 'Account', contextId = '1', mocks = accountMocks({childGroupsCount: 0})} = {}
  ) => {
    return rtlRender(
      <OutcomesContext.Provider value={{env: {contextType, contextId}}}>
        <MockedProvider cache={cache} mocks={mocks}>
          {children}
        </MockedProvider>
      </OutcomesContext.Provider>
    )
  }

  it('renders the empty billboard for accounts without child outcomes', async () => {
    const {getByText} = render(<OutcomeManagementPanel />)
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText(/Outcomes have not been added to this account yet/)).not.toBeNull()
  })

  it('renders the empty billboard for courses without child outcomes', async () => {
    const {getByText} = render(<OutcomeManagementPanel />, {
      contextType: 'Course',
      contextId: '2',
      mocks: courseMocks({childGroupsCount: 0})
    })
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText(/Outcomes have not been added to this course yet/)).not.toBeNull()
  })

  it('loads outcome group data for Account', async () => {
    const {getByText, getAllByText} = render(<OutcomeManagementPanel />, {
      mocks: accountMocks({childGroupsCount: 2})
    })
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText(/Outcome Groups/)).toBeInTheDocument()
    expect(getByText('Account folder 0')).toBeInTheDocument()
    expect(getByText('Account folder 1')).toBeInTheDocument()
    expect(getAllByText('2 Groups | 2 Outcomes').length).toBe(2)
  })

  it('loads outcome group data for Course', async () => {
    const {getByText, getAllByText} = render(<OutcomeManagementPanel />, {
      contextType: 'Course',
      contextId: '2',
      mocks: courseMocks({childGroupsCount: 2})
    })
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText(/Outcome Groups/)).toBeInTheDocument()
    expect(getByText('Course folder 0')).toBeInTheDocument()
    expect(getByText('Course folder 1')).toBeInTheDocument()
    expect(getAllByText('10 Groups | 2 Outcomes').length).toBe(2)
  })

  it('loads nested groups', async () => {
    const {getByText} = render(<OutcomeManagementPanel />, {
      mocks: [
        ...accountMocks({childGroupsCount: 2}),
        ...groupMocks({groupId: 100}),
        ...groupDetailMocks({groupId: 100, contextType: 'Account', contextId: '1'})
      ]
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Account folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText('Group 100 folder 0')).toBeInTheDocument()
  })

  it('displays an error on failed request for course outcome groups', async () => {
    render(<OutcomeManagementPanel />, {
      contextType: 'Course',
      contextId: '2',
      mocks: []
    })
    await act(async () => jest.runOnlyPendingTimers())
    expect(showFlashAlertSpy).toHaveBeenCalledWith({
      message: 'An error occurred while loading course outcomes.',
      type: 'error'
    })
  })

  it('displays an error on failed request for account outcome groups', async () => {
    render(<OutcomeManagementPanel />, {
      mocks: []
    })
    await act(async () => jest.runOnlyPendingTimers())
    expect(showFlashAlertSpy).toHaveBeenCalledWith({
      message: 'An error occurred while loading account outcomes.',
      type: 'error'
    })
  })

  it('loads group detail data correctly', async () => {
    const {getByText} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText('Group 200 Outcomes')).toBeInTheDocument()
    expect(getByText('Outcome 1 - Group 200')).toBeInTheDocument()
    expect(getByText('Outcome 2 - Group 200')).toBeInTheDocument()
  })

  it('shows remove group modal if remove option from group menu is selected', async () => {
    const {getByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Outcome Group Menu'))
    fireEvent.click(within(getByRole('menu')).getByText('Remove'))
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText('Remove Group?')).toBeInTheDocument()
  })

  describe('Moving a group', () => {
    it('shows move group modal if move option from group menu is selected', async () => {
      const {getByText, getAllByText} = render(<OutcomeManagementPanel />, {
        ...groupDetailDefaultProps
      })
      await act(async () => jest.runOnlyPendingTimers())
      fireEvent.click(getByText('Course folder 0'))
      await act(async () => jest.runOnlyPendingTimers())
      fireEvent.click(getByText('Outcome Group Menu'))
      fireEvent.click(getAllByText('Move')[getAllByText('Move').length - 1])
      await act(async () => jest.runOnlyPendingTimers())
      expect(getByText('Where would you like to move this group?')).toBeInTheDocument()
    })

    it('shows successful flash message when moving a group succeeds', async () => {
      // API mock
      jest.spyOn(api, 'moveOutcomeGroup').mockImplementation(() => Promise.resolve({status: 200}))

      const {getByText, getByRole} = render(<OutcomeManagementPanel />, {
        ...groupDetailDefaultProps
      })
      await act(async () => jest.runOnlyPendingTimers())
      // OutcomeManagementPanel Group Tree Browser
      fireEvent.click(getByText('Course folder 0'))
      await act(async () => jest.runOnlyPendingTimers())
      // OutcomeManagementPanel Outcome Group Kebab Menu
      fireEvent.click(getByText('Outcome Group Menu'))
      fireEvent.click(within(getByRole('menu')).getByText('Move'))
      await act(async () => jest.runOnlyPendingTimers())
      // Move Modal
      fireEvent.click(within(getByRole('dialog')).getByText('Root course folder'))
      await act(async () => jest.runAllTimers())
      fireEvent.click(within(getByRole('dialog')).getByText('Course folder 1'))
      await act(async () => jest.runOnlyPendingTimers())
      fireEvent.click(within(getByRole('dialog')).getByText('Move'))
      await act(async () => jest.runOnlyPendingTimers())
      // moveOutcomeGroup API call & success flash alert
      expect(api.moveOutcomeGroup).toHaveBeenCalledWith('Course', '2', 200, 201)
      await act(async () => jest.runOnlyPendingTimers())
      expect(showFlashAlertSpy).toHaveBeenCalledWith({
        message: '"Group 200" has been moved to "Course folder 1".',
        type: 'success'
      })
    })

    it('shows error flash message when moving a group fails', async () => {
      // API mock
      jest
        .spyOn(api, 'moveOutcomeGroup')
        .mockImplementation(() => Promise.reject(new Error('Network error')))

      const {getByText, getByRole} = render(<OutcomeManagementPanel />, {
        ...groupDetailDefaultProps
      })
      await act(async () => jest.runOnlyPendingTimers())
      // OutcomeManagementPanel Group Tree Browser
      fireEvent.click(getByText('Course folder 0'))
      await act(async () => jest.runOnlyPendingTimers())
      // OutcomeManagementPanel Outcome Group Kebab Menu
      fireEvent.click(getByText('Outcome Group Menu'))
      fireEvent.click(within(getByRole('menu')).getByText('Move'))
      await act(async () => jest.runOnlyPendingTimers())
      // Move Modal
      fireEvent.click(within(getByRole('dialog')).getByText('Root course folder'))
      await act(async () => jest.runAllTimers())
      fireEvent.click(within(getByRole('dialog')).getByText('Course folder 1'))
      await act(async () => jest.runOnlyPendingTimers())
      fireEvent.click(within(getByRole('dialog')).getByText('Move'))
      await act(async () => jest.runOnlyPendingTimers())
      // moveOutcomeGroup API call & error flash alert
      expect(api.moveOutcomeGroup).toHaveBeenCalledWith('Course', '2', 200, 201)
      await act(async () => jest.runOnlyPendingTimers())
      expect(showFlashAlertSpy).toHaveBeenCalledWith({
        message: 'An error occurred moving group "Group 200": Network error',
        type: 'error'
      })
    })
  })

  it('selects/unselects outcome via checkbox', async () => {
    const {getByText, getAllByText} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getAllByText('Select outcome')[0])
    expect(getByText('1 Outcome Selected')).toBeInTheDocument()
    fireEvent.click(getAllByText('Select outcome')[0])
    expect(getByText('0 Outcomes Selected')).toBeInTheDocument()
  })

  it('shows remove outcome modal if remove option from individual outcome menu is selected', async () => {
    const {getByText, getAllByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getAllByText('Outcome Menu')[0])
    fireEvent.click(within(getByRole('menu')).getByText('Remove'))
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText('Remove Outcome?')).toBeInTheDocument()
  })

  it('shows edit outcome modal if edit option from individual outcome menu is selected', async () => {
    const {getByText, getAllByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getAllByText('Outcome Menu')[0])
    fireEvent.click(within(getByRole('menu')).getByText('Edit'))
    await act(async () => jest.runOnlyPendingTimers())
    expect(getByText('Edit Outcome')).toBeInTheDocument()
  })

  it('shows move outcome modal if move option from individual outcome menu is selected', async () => {
    const {getByText, getAllByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runAllTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runAllTimers())
    fireEvent.click(getAllByText('Outcome Menu')[0])
    fireEvent.click(within(getByRole('menu')).getByText('Move'))
    await act(async () => jest.runAllTimers())
    expect(getByText('Where would you like to move this outcome?')).toBeInTheDocument()
  })

  it('clears selected outcome when edit outcome modal is closed', async () => {
    const {getByText, getAllByText, queryByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getAllByText('Outcome Menu')[0])
    fireEvent.click(within(getByRole('menu')).getByText('Edit'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Cancel'))
    expect(queryByText('Edit Outcome')).not.toBeInTheDocument()
  })

  it('clears selected outcome when remove outcome modal is closed', async () => {
    const {getByText, getAllByText, queryByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getAllByText('Outcome Menu')[0])
    fireEvent.click(within(getByRole('menu')).getByText('Remove'))
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Cancel'))
    expect(queryByText('Remove Outcome?')).not.toBeInTheDocument()
  })

  it('clears selected outcome when move outcome modal is closed', async () => {
    const {getByText, getAllByText, queryByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runAllTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runAllTimers())
    fireEvent.click(getAllByText('Outcome Menu')[0])
    fireEvent.click(within(getByRole('menu')).getByText('Move'))
    await act(async () => jest.runAllTimers())
    fireEvent.click(getByText('Cancel'))
    expect(queryByText('Move "Outcome 1 - Group 200"')).not.toBeInTheDocument()
  })

  it('hides the Outcome Menu if the user doesnt have permission to edit the outcome', async () => {
    const {getByText, queryByText} = render(<OutcomeManagementPanel />, {
      contextType: 'Course',
      contextId: '2',
      mocks: [
        ...courseMocks({childGroupsCount: 2, canEdit: false}),
        ...groupMocks({groupId: 200, canEdit: false}),
        ...groupDetailMocks({groupId: 200, contextType: 'Course', contextId: '2', canEdit: false})
      ]
    })
    await act(async () => jest.runOnlyPendingTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runOnlyPendingTimers())
    expect(queryByText('Outcome Menu')).not.toBeInTheDocument()
  })

  it('calls startMoveOutcome with correct args and closes move outcome modal when user clicks on Move button', async () => {
    const {getByText, getAllByText, queryByText, getByRole} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runAllTimers())
    // OutcomeManagementPanel Group Tree Browser
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runAllTimers())
    // OutcomeManagementPanel First Outcome Kebab Menu
    fireEvent.click(getAllByText('Outcome Menu')[0])
    fireEvent.click(within(getByRole('menu')).getByText('Move'))
    await act(async () => jest.runAllTimers())
    // Move Modal
    fireEvent.click(within(getByRole('dialog')).getByText('Root course folder'))
    await act(async () => jest.runAllTimers())
    fireEvent.click(within(getByRole('dialog')).getByText('Move'))
    await act(async () => jest.runAllTimers())
    expect(startMoveOutcome).toHaveBeenCalledWith('Course', '2', outcome, 200, newParentGroup)
    expect(queryByText('Move "Outcome 1 - Group 200"')).not.toBeInTheDocument()
  })

  it('should not disable search input and clear search button (X) if there are no results', async () => {
    const {getByText, getByLabelText, queryByTestId} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps
    })
    await act(async () => jest.runAllTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runAllTimers())
    expect(getByText('2 "Group 200" Outcomes')).toBeInTheDocument()
    fireEvent.change(getByLabelText('Search field'), {target: {value: 'no matched results'}})
    await act(async () => jest.advanceTimersByTime(500))
    expect(getByLabelText('Search field')).toBeEnabled()
    expect(queryByTestId('clear-search-icon')).toBeInTheDocument()
  })

  it('debounces search string typed by user', async () => {
    const {getByText, getByLabelText} = render(<OutcomeManagementPanel />, {
      ...groupDetailDefaultProps,
      mocks: [
        ...courseMocks({childGroupsCount: 2}),
        ...groupMocks({groupId: 200}),
        ...groupDetailMocks({
          groupId: 200,
          contextType: 'Course',
          contextId: '2',
          searchQuery: 'Outcome 1'
        })
      ]
    })
    await act(async () => jest.runAllTimers())
    fireEvent.click(getByText('Course folder 0'))
    await act(async () => jest.runAllTimers())
    expect(getByText('2 "Group 200" Outcomes')).toBeInTheDocument()
    const searchInput = getByLabelText('Search field')
    fireEvent.change(searchInput, {target: {value: 'Outcome'}})
    await act(async () => jest.advanceTimersByTime(100))
    expect(getByText('2 "Group 200" Outcomes')).toBeInTheDocument()
    fireEvent.change(searchInput, {target: {value: 'Outcome '}})
    await act(async () => jest.advanceTimersByTime(300))
    expect(getByText('2 "Group 200" Outcomes')).toBeInTheDocument()
    fireEvent.change(searchInput, {target: {value: 'Outcome 1'}})
    await act(async () => jest.advanceTimersByTime(500))
    expect(getByText('1 "Group 200" Outcome')).toBeInTheDocument()
  })
})
