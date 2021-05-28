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

import React, {useEffect, useRef, useState} from 'react'
import {connect, Provider} from 'react-redux'
import I18n from 'i18n!k5_course'
import PropTypes from 'prop-types'

import {
  createTeacherPreview,
  startLoadingAllOpportunities,
  store
} from '@instructure/canvas-planner'
import {
  IconBankLine,
  IconCalendarMonthLine,
  IconEditSolid,
  IconHomeLine,
  IconModuleLine,
  IconStarLightLine,
  IconStudentViewLine
} from '@instructure/ui-icons'
import {ApplyTheme} from '@instructure/ui-themeable'
import {Button} from '@instructure/ui-buttons'
import {Heading} from '@instructure/ui-heading'
import {TruncateText} from '@instructure/ui-truncate-text'
import {View} from '@instructure/ui-view'
import {Flex} from '@instructure/ui-flex'

import K5DashboardContext from '@canvas/k5/react/K5DashboardContext'
import K5Tabs from '@canvas/k5/react/K5Tabs'
import SchedulePage from '@canvas/k5/react/SchedulePage'
import usePlanner from '@canvas/k5/react/hooks/usePlanner'
import useTabState from '@canvas/k5/react/hooks/useTabState'
import {mapStateToProps} from '@canvas/k5/redux/redux-helpers'
import {parseAnnouncementDetails, DEFAULT_COURSE_COLOR, TAB_IDS} from '@canvas/k5/react/utils'
import {theme} from '@canvas/k5/react/k5-theme'
import EmptyCourse from './EmptyCourse'
import OverviewPage from './OverviewPage'
import {GradesPage} from './GradesPage'
import {outcomeProficiencyShape} from '@canvas/grade-summary/react/IndividualStudentMastery/shapes'
import K5Announcement from '@canvas/k5/react/K5Announcement'
import ResourcesPage from '@canvas/k5/react/ResourcesPage'

const HERO_HEIGHT_PX = 400

const COURSE_TABS = [
  {
    id: TAB_IDS.HOME,
    icon: IconHomeLine,
    label: I18n.t('Home')
  },
  {
    id: TAB_IDS.SCHEDULE,
    icon: IconCalendarMonthLine,
    label: I18n.t('Schedule')
  },
  {
    id: TAB_IDS.MODULES,
    icon: IconModuleLine,
    label: I18n.t('Modules')
  },
  {
    id: TAB_IDS.GRADES,
    icon: IconStarLightLine,
    label: I18n.t('Grades')
  },
  {
    id: TAB_IDS.RESOURCES,
    icon: IconBankLine,
    label: I18n.t('Resources')
  }
]

// Translates server-side tab IDs to their associated frontend IDs
const translateTabId = id => {
  if (id === '19') return TAB_IDS.SCHEDULE
  if (id === '10') return TAB_IDS.MODULES
  if (id === '5') return TAB_IDS.GRADES
  if (String(id).startsWith('context_external_tool_')) return TAB_IDS.RESOURCES
  return TAB_IDS.HOME
}

const toRenderTabs = tabs =>
  tabs.reduce((acc, {id, hidden}) => {
    if (hidden) return acc
    const renderId = translateTabId(id)
    const renderTab = COURSE_TABS.find(tab => tab.id === renderId)
    if (renderTab && !acc.some(tab => tab.id === renderId)) {
      acc.push(renderTab)
    }
    return acc
  }, [])

export function CourseHeaderHero({name, image, backgroundColor, shouldShrink}) {
  return (
    <div
      id="k5-course-header-hero"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: !image && backgroundColor,
        backgroundImage: image && `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '8px',
        minHeight: shouldShrink ? '100px' : '25vh',
        maxHeight: `${HERO_HEIGHT_PX}px`,
        marginBottom: '1rem'
      }}
      aria-hidden="true"
      data-testid="k5-course-header-hero"
    >
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.7), transparent)',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          padding: '1rem'
        }}
      >
        <Heading as="h1" color="primary-inverse">
          <TruncateText>{name}</TruncateText>
        </Heading>
      </div>
    </div>
  )
}

export function CourseHeaderOptions({settingsPath, showStudentView, studentViewPath, canManage}) {
  return (
    <View
      id="k5-course-header-options"
      as="section"
      borderWidth="0 0 small 0"
      padding="0 0 medium 0"
      margin="0 0 medium 0"
    >
      <Flex direction="row">
        {canManage && (
          <Flex.Item shouldGrow shouldShrink>
            <Button
              id="manage-subject-btn"
              data-testid="manage-button"
              href={settingsPath}
              renderIcon={<IconEditSolid />}
            >
              {I18n.t('Manage Subject')}
            </Button>
          </Flex.Item>
        )}
        {showStudentView && (
          <Flex.Item shouldGrow shouldShrink textAlign="end">
            <Button
              id="student-view-btn"
              href={studentViewPath}
              data-method="post"
              renderIcon={<IconStudentViewLine />}
            >
              {I18n.t('Student View')}
            </Button>
          </Flex.Item>
        )}
      </Flex>
    </View>
  )
}

export function K5Course({
  assignmentsDueToday,
  assignmentsMissing,
  assignmentsCompletedForToday,
  color,
  courseOverview,
  defaultTab,
  id,
  imageUrl,
  loadAllOpportunities,
  name,
  timeZone,
  canManage = false,
  plannerEnabled = false,
  hideFinalGrades,
  currentUser,
  userIsStudent,
  userIsInstructor,
  showStudentView,
  studentViewPath,
  showLearningMasteryGradebook,
  outcomeProficiency,
  tabs,
  settingsPath,
  latestAnnouncement
}) {
  const renderTabs = toRenderTabs(tabs)
  const {activeTab, currentTab, handleTabChange} = useTabState(defaultTab, renderTabs)
  const [tabsRef, setTabsRef] = useState(null)
  const plannerInitialized = usePlanner({
    plannerEnabled,
    isPlannerActive: () => activeTab.current === TAB_IDS.SCHEDULE,
    focusFallback: tabsRef,
    callback: () => loadAllOpportunities(),
    singleCourse: true
  })

  /* Rails renders the modules partial into #k5-modules-container. After the first render, we hide that div and
     move it into the main <View> of K5Course so the sticky tabs stick. Then show/hide it based off currentTab */
  const modulesRef = useRef(null)
  const contentRef = useRef(null)
  useEffect(() => {
    modulesRef.current = document.getElementById('k5-modules-container')
    contentRef.current.appendChild(modulesRef.current)
  }, [])

  useEffect(() => {
    if (modulesRef.current) {
      modulesRef.current.style.display = currentTab === TAB_IDS.MODULES ? 'block' : 'none'
    }
  }, [currentTab])

  const courseHeader = sticky => {
    const extendedViewport = window.innerHeight + 180
    const contentHeight = document.body.scrollHeight
    // makes sure that there is at least 180px of overflow, before shrinking the hero image
    // this cancels the intermittent effect in the sticky prop when the window is almost
    // the same size of the content
    const shouldShrink =
      sticky && activeTab.current === currentTab && contentHeight > extendedViewport
    return (
      <View id="k5-course-header" as="div" padding={sticky ? 'medium 0 0 0' : '0'}>
        {(canManage || showStudentView) && (
          <CourseHeaderOptions
            canManage={canManage}
            settingsPath={settingsPath}
            showStudentView={showStudentView}
            studentViewPath={studentViewPath}
          />
        )}
        <CourseHeaderHero
          name={name}
          image={imageUrl}
          backgroundColor={color || DEFAULT_COURSE_COLOR}
          shouldShrink={shouldShrink}
        />
      </View>
    )
  }

  // Only render the K5Tabs component if we actually have any visible tabs
  const courseTabs = renderTabs?.length ? (
    <K5Tabs
      currentTab={currentTab}
      onTabChange={handleTabChange}
      tabs={renderTabs}
      tabsRef={setTabsRef}
    >
      {sticky => courseHeader(sticky)}
    </K5Tabs>
  ) : (
    courseHeader()
  )

  const announcementDetails = parseAnnouncementDetails(latestAnnouncement, {
    id,
    shortName: name,
    href: `/courses/${id}`,
    canManage
  })

  return (
    <K5DashboardContext.Provider
      value={{
        assignmentsDueToday,
        assignmentsMissing,
        assignmentsCompletedForToday,
        isStudent: plannerEnabled
      }}
    >
      <View as="section" data-testid="main-content" elementRef={e => (contentRef.current = e)}>
        {courseTabs}
        {!renderTabs?.length && <EmptyCourse name={name} id={id} canManage={canManage} />}
        {currentTab === renderTabs?.[0]?.id && latestAnnouncement && (
          <K5Announcement
            showCourseDetails={false}
            {...announcementDetails.announcement}
            {...announcementDetails}
          />
        )}
        {currentTab === TAB_IDS.HOME && <OverviewPage content={courseOverview} />}
        {plannerInitialized && <SchedulePage visible={currentTab === TAB_IDS.SCHEDULE} />}
        {!plannerEnabled && currentTab === TAB_IDS.SCHEDULE && createTeacherPreview(timeZone)}
        {currentTab === TAB_IDS.GRADES && (
          <GradesPage
            courseId={id}
            courseName={name}
            hideFinalGrades={hideFinalGrades}
            currentUser={currentUser}
            userIsStudent={userIsStudent}
            userIsInstructor={userIsInstructor}
            showLearningMasteryGradebook={showLearningMasteryGradebook}
            outcomeProficiency={outcomeProficiency}
          />
        )}
        {currentTab === TAB_IDS.RESOURCES && (
          <ResourcesPage
            cards={[{id, originalName: name, shortName: name, isHomeroom: false, canManage}]}
            cardsSettled
            visible={currentTab === TAB_IDS.RESOURCES}
            showStaff={false}
            filterToHomerooms={false}
          />
        )}
      </View>
    </K5DashboardContext.Provider>
  )
}

K5Course.propTypes = {
  assignmentsDueToday: PropTypes.object.isRequired,
  assignmentsMissing: PropTypes.object.isRequired,
  assignmentsCompletedForToday: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  loadAllOpportunities: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  timeZone: PropTypes.string.isRequired,
  canManage: PropTypes.bool,
  color: PropTypes.string,
  defaultTab: PropTypes.string,
  imageUrl: PropTypes.string,
  plannerEnabled: PropTypes.bool,
  courseOverview: PropTypes.string.isRequired,
  hideFinalGrades: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  userIsStudent: PropTypes.bool.isRequired,
  userIsInstructor: PropTypes.bool.isRequired,
  showStudentView: PropTypes.bool.isRequired,
  studentViewPath: PropTypes.string.isRequired,
  showLearningMasteryGradebook: PropTypes.bool.isRequired,
  outcomeProficiency: outcomeProficiencyShape,
  tabs: PropTypes.arrayOf(PropTypes.object).isRequired,
  settingsPath: PropTypes.string.isRequired,
  latestAnnouncement: PropTypes.object
}

const WrappedK5Course = connect(mapStateToProps, {
  loadAllOpportunities: startLoadingAllOpportunities
})(K5Course)

export default props => (
  <ApplyTheme theme={theme}>
    <Provider store={store}>
      <WrappedK5Course {...props} />
    </Provider>
  </ApplyTheme>
)
