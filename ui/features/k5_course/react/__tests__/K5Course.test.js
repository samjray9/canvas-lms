/*
 * Copyright (C) 2021 - present Instructure, Inc.
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

import React from 'react'
import moxios from 'moxios'
import tz from '@canvas/timezone'
import {render, waitFor} from '@testing-library/react'
import {K5Course} from '../K5Course'
import fetchMock from 'fetch-mock'
import {
  MOCK_COURSE_SYLLABUS,
  MOCK_COURSE_APPS,
  MOCK_COURSE_TABS,
  MOCK_GRADING_PERIODS_EMPTY,
  MOCK_ASSIGNMENT_GROUPS,
  MOCK_ENROLLMENTS
} from './mocks'
import {TAB_IDS} from '@canvas/k5/react/utils'

const currentUser = {
  id: '1',
  display_name: 'Geoffrey Jellineck'
}
const defaultEnv = {
  current_user: currentUser,
  K5_MODE: true,
  FEATURES: {
    canvas_for_elementary: true,
    unpublished_courses: true
  },
  PREFERENCES: {
    hide_dashcard_color_overlays: false
  },
  MOMENT_LOCALE: 'en',
  TIMEZONE: 'America/Denver'
}
const defaultTabs = [{id: '0'}, {id: '19'}, {id: '10'}, {id: '5'}, {id: 'context_external_tool_1'}]
const defaultProps = {
  currentUser,
  loadAllOpportunities: () => {},
  name: 'Arts and Crafts',
  id: '30',
  timeZone: defaultEnv.TIMEZONE,
  canManage: false,
  courseOverview: '<h2>Time to learn!</h2>',
  hideFinalGrades: false,
  userIsStudent: true,
  userIsInstructor: false,
  showStudentView: false,
  studentViewPath: '/courses/30/student_view/1',
  showLearningMasteryGradebook: false,
  tabs: defaultTabs,
  settingsPath: '/courses/30/settings',
  latestAnnouncement: {
    id: '12',
    title: 'Important announcement',
    message: '<p>Read this closely.</p>',
    html_url: '/courses/30/discussion_topics/12',
    attachments: [
      {
        filename: 'hw.pdf',
        display_name: 'hw.pdf',
        url: 'http://address/to/hw.pdf'
      }
    ],
    permissions: {
      update: true
    },
    posted_at: '2021-05-14T17:06:21-06:00'
  }
}
const FETCH_IMPORTANT_INFO_URL = encodeURI('/api/v1/courses/30?include[]=syllabus_body')
const FETCH_APPS_URL = '/api/v1/courses/30/external_tools/visible_course_nav_tools'
const FETCH_TABS_URL = '/api/v1/courses/30/tabs'
const GRADING_PERIODS_URL = encodeURI(
  '/api/v1/courses/30?include[]=grading_periods&include[]=current_grading_period_scores&include[]=total_scores'
)
const ASSIGNMENT_GROUPS_URL = encodeURI(
  '/api/v1/courses/30/assignment_groups?include[]=assignments&include[]=submission&include[]=read_state'
)
const ENROLLMENTS_URL = '/api/v1/courses/30/enrollments'

let modulesContainer

beforeAll(() => {
  moxios.install()
  fetchMock.get(FETCH_IMPORTANT_INFO_URL, JSON.stringify(MOCK_COURSE_SYLLABUS))
  fetchMock.get(FETCH_APPS_URL, JSON.stringify(MOCK_COURSE_APPS))
  fetchMock.get(FETCH_TABS_URL, JSON.stringify(MOCK_COURSE_TABS))
  fetchMock.get(GRADING_PERIODS_URL, JSON.stringify(MOCK_GRADING_PERIODS_EMPTY))
  fetchMock.get(ASSIGNMENT_GROUPS_URL, JSON.stringify(MOCK_ASSIGNMENT_GROUPS))
  fetchMock.get(ENROLLMENTS_URL, JSON.stringify(MOCK_ENROLLMENTS))
  if (!modulesContainer) {
    modulesContainer = document.createElement('div')
    modulesContainer.id = 'k5-modules-container'
    modulesContainer.style.display = 'none'
    modulesContainer.innerHTML = 'Course modules content'
    document.body.appendChild(modulesContainer)
  }
})

afterAll(() => {
  moxios.uninstall()
  fetchMock.restore()
  if (modulesContainer) {
    modulesContainer.remove()
  }
})

beforeEach(() => {
  global.ENV = defaultEnv
})

afterEach(() => {
  global.ENV = {}
})

describe('K-5 Subject Course', () => {
  describe('Tabs Header', () => {
    it('displays a huge version of the course image if set', () => {
      const imageUrl = 'https://example.com/path/to/image.png'
      const {getByTestId} = render(<K5Course {...defaultProps} imageUrl={imageUrl} />)
      const hero = getByTestId('k5-course-header-hero')

      expect(hero).toBeInTheDocument()
      expect(hero.style.getPropertyValue('background-image')).toBe(`url(${imageUrl})`)
    })

    it('displays the course color if one is set but no course image is set', () => {
      const {getByTestId} = render(<K5Course {...defaultProps} color="#bb8" />)
      const hero = getByTestId('k5-course-header-hero')

      expect(hero.style.getPropertyValue('background-color')).toBe('rgb(187, 187, 136)')
    })

    it('displays a gray background on the hero header if no course color or image is set', () => {
      const {getByTestId} = render(<K5Course {...defaultProps} />)
      const hero = getByTestId('k5-course-header-hero')

      expect(hero.style.getPropertyValue('background-color')).toBe('rgb(57, 75, 88)')
    })

    it('displays the course name', () => {
      const {getByText} = render(<K5Course {...defaultProps} />)
      expect(getByText(defaultProps.name)).toBeInTheDocument()
    })

    it('shows Home, Schedule, Modules, Grades, and Resources options if configured', () => {
      const {getByText} = render(<K5Course {...defaultProps} />)
      ;['Home', 'Schedule', 'Modules', 'Grades', 'Resources'].forEach(label =>
        expect(getByText(label)).toBeInTheDocument()
      )
    })

    it('defaults to the first tab', () => {
      const {getByRole} = render(<K5Course {...defaultProps} />)
      expect(getByRole('tab', {name: 'Home', selected: true})).toBeInTheDocument()
    })

    it('only renders non-hidden tabs, in the order they are provided', () => {
      const tabs = [
        {id: '10'},
        {id: '5', hidden: true},
        {id: '19'},
        {id: 'context_external_tool_3', hidden: true}
      ]
      const {getAllByRole} = render(<K5Course {...defaultProps} tabs={tabs} />)
      const renderedTabs = getAllByRole('tab')
      expect(renderedTabs.map(({id}) => id.replace('tab-', ''))).toEqual([
        TAB_IDS.MODULES,
        TAB_IDS.SCHEDULE
      ])
    })

    it('renders an empty state instead of any tabs if none are provided', () => {
      const {getByTestId, getByText, queryByRole} = render(<K5Course {...defaultProps} tabs={[]} />)
      expect(getByText(defaultProps.name)).toBeInTheDocument()
      expect(queryByRole('tab')).not.toBeInTheDocument()
      expect(getByTestId('space-panda')).toBeInTheDocument()
      expect(getByText('Welcome to the cold, dark void of Arts and Crafts.')).toBeInTheDocument()
    })

    it('renders a link to update tab settings if no tabs are provided and the user has manage permissions', () => {
      const {getByRole} = render(<K5Course {...defaultProps} canManage tabs={[]} />)
      const link = getByRole('link', {name: 'Reestablish your world'})
      expect(link).toBeInTheDocument()
      expect(link.href).toBe('http://localhost/courses/30/settings#tab-navigation')
    })
  })

  describe('Manage course functionality', () => {
    it('Shows a manage button when the user has manage permissions', () => {
      const {getByRole} = render(<K5Course {...defaultProps} canManage />)
      expect(getByRole('link', {name: 'Manage Subject'})).toBeInTheDocument()
    })

    it('Should redirect to course settings path when clicked', async () => {
      const {getByRole} = render(<K5Course {...defaultProps} canManage />)
      const manageSubjectBtn = getByRole('link', {name: 'Manage Subject'})
      expect(manageSubjectBtn.href).toBe('http://localhost/courses/30/settings')
    })

    it('Does not show a manage button when the user does not have manage permissions', () => {
      const {queryByRole} = render(<K5Course {...defaultProps} />)
      expect(queryByRole('link', {name: 'Manage Subject'})).not.toBeInTheDocument()
    })
  })

  describe('Student View Button functionality', () => {
    it('Shows the Student View button when the user has student view mode access', () => {
      const {queryByRole} = render(<K5Course {...defaultProps} showStudentView />)
      expect(queryByRole('link', {name: 'Student View'})).toBeInTheDocument()
    })

    it('Does not show the Student View button when the user does not have student view mode access', () => {
      const {queryByRole} = render(<K5Course {...defaultProps} />)
      expect(queryByRole('link', {name: 'Student View'})).not.toBeInTheDocument()
    })

    it('Should open student view path when clicked', () => {
      const {getByRole} = render(<K5Course {...defaultProps} showStudentView />)
      const studentViewBtn = getByRole('link', {name: 'Student View'})
      expect(studentViewBtn.href).toBe('http://localhost/courses/30/student_view/1')
    })
  })

  describe('subject announcements', () => {
    it('shows the latest announcement, attachment, date, and edit button on the subject home', () => {
      const {getByText, getByRole} = render(<K5Course {...defaultProps} canManage />)
      expect(getByText('Important announcement')).toBeInTheDocument()
      expect(getByText('Read this closely.')).toBeInTheDocument()
      const button = getByRole('link', {name: 'Edit announcement Important announcement'})
      expect(button).toBeInTheDocument()
      expect(button.href).toContain('/courses/30/discussion_topics/12')
      const attachment = getByRole('link', {name: 'hw.pdf'})
      expect(attachment).toBeInTheDocument()
      expect(attachment.href).toBe('http://address/to/hw.pdf')
      expect(
        getByText(
          `Posted on ${tz.format('2021-05-14T17:06:21-06:00', 'date.formats.full_with_weekday')}`
        )
      ).toBeInTheDocument()
    })

    it('hides the edit button if student', () => {
      const props = defaultProps
      props.latestAnnouncement.permissions.update = false
      const {queryByRole} = render(<K5Course {...props} />)
      expect(
        queryByRole('link', {name: 'Edit announcement Important announcement'})
      ).not.toBeInTheDocument()
    })

    it('puts the announcement on whichever tab is set as main tab', () => {
      const tabs = [{id: '10'}, {id: '0'}]
      const {getByText} = render(<K5Course {...defaultProps} tabs={tabs} />)
      expect(getByText('Important announcement')).toBeInTheDocument()
    })
  })

  describe('home tab', () => {
    it('shows front page content if a front page is set', () => {
      const {getByText} = render(<K5Course {...defaultProps} defaultTab={TAB_IDS.HOME} />)
      expect(getByText('Time to learn!')).toBeInTheDocument()
    })
  })

  describe('modules tab', () => {
    it('shows modules content if modules tab is selected', async () => {
      const {getByText} = render(<K5Course {...defaultProps} defaultTab={TAB_IDS.MODULES} />)
      expect(getByText('Course modules content')).toBeVisible()
    })

    it('hides modules content if modules tab is not selected', async () => {
      const {getByText} = render(<K5Course {...defaultProps} defaultTab={TAB_IDS.HOME} />)
      expect(getByText('Course modules content')).not.toBeVisible()
    })
  })

  describe('grades tab', () => {
    it('fetches and displays grade information', async () => {
      const {getByText} = render(<K5Course {...defaultProps} defaultTab={TAB_IDS.GRADES} />)
      await waitFor(() => expect(getByText('WWII Report')).toBeInTheDocument())
      ;['Reports', '9.5 pts', 'Out of 10 pts'].forEach(t => {
        expect(getByText(t)).toBeInTheDocument()
      })
      expect(getByText('Submitted', {exact: false})).toBeInTheDocument()
    })

    it('shows course total', async () => {
      const {findByText} = render(<K5Course {...defaultProps} defaultTab={TAB_IDS.GRADES} />)
      expect(await findByText('Total: 89.39%')).toBeInTheDocument()
    })

    it('shows tab for LMGB if enabled', () => {
      const {getByRole} = render(
        <K5Course {...defaultProps} showLearningMasteryGradebook defaultTab={TAB_IDS.GRADES} />
      )
      expect(getByRole('tab', {name: 'Learning Mastery'})).toBeInTheDocument()
    })
  })

  describe('resources tab', () => {
    describe('important info section', () => {
      it('shows syllabus content with link to edit if teacher', async () => {
        const {findByText, getByRole} = render(
          <K5Course {...defaultProps} canManage defaultTab={TAB_IDS.RESOURCES} />
        )
        expect(await findByText('This is really important.')).toBeInTheDocument()
        const editLink = getByRole('link', {name: 'Edit important info for Arts and Crafts'})
        expect(editLink).toBeInTheDocument()
        expect(editLink.href).toContain('/courses/30/assignments/syllabus')
      })

      it("doesn't show an edit button if not canManage", async () => {
        const {findByText, queryByRole} = render(
          <K5Course {...defaultProps} defaultTab={TAB_IDS.RESOURCES} />
        )
        expect(await findByText('This is really important.')).toBeInTheDocument()
        expect(
          queryByRole('link', {name: 'Edit important info for Arts and Crafts'})
        ).not.toBeInTheDocument()
      })

      it('shows loading skeletons while loading', async () => {
        const {getByText, queryByText} = render(
          <K5Course {...defaultProps} defaultTab={TAB_IDS.RESOURCES} />
        )
        expect(getByText('Loading important info')).toBeInTheDocument()
        await waitFor(() => {
          expect(queryByText('Loading important info')).not.toBeInTheDocument()
        })
      })

      it('shows an error if syllabus content fails to load', async () => {
        fetchMock.get(FETCH_IMPORTANT_INFO_URL, 400, {overwriteRoutes: true})
        const {findAllByText} = render(
          <K5Course {...defaultProps} defaultTab={TAB_IDS.RESOURCES} />
        )
        const errors = await findAllByText('Failed to load important info.')
        expect(errors[0]).toBeInTheDocument()
      })
    })

    describe('apps section', () => {
      it("displays user's apps", async () => {
        const {getByText} = render(<K5Course {...defaultProps} defaultTab={TAB_IDS.RESOURCES} />)
        await waitFor(() => {
          expect(getByText('Studio')).toBeInTheDocument()
          expect(getByText('Student Applications')).toBeInTheDocument()
        })
      })

      it('shows some loading skeletons while apps are loading', async () => {
        const {getAllByText, queryByText} = render(
          <K5Course {...defaultProps} defaultTab={TAB_IDS.RESOURCES} />
        )
        await waitFor(() => {
          expect(getAllByText('Loading apps...')[0]).toBeInTheDocument()
          expect(queryByText('Studio')).not.toBeInTheDocument()
        })
      })

      it('shows an error if apps fail to load', async () => {
        fetchMock.get(FETCH_APPS_URL, 400, {overwriteRoutes: true})
        const {getAllByText} = render(<K5Course {...defaultProps} defaultTab={TAB_IDS.RESOURCES} />)
        await waitFor(() => expect(getAllByText('Failed to load apps.')[0]).toBeInTheDocument())
      })
    })
  })
})
