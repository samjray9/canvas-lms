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

import I18n from 'i18n!discussion_posts'
import PropTypes from 'prop-types'
import React, {useMemo} from 'react'
import {ToggleButton} from './ToggleButton'

import {Flex} from '@instructure/ui-flex'
import {
  IconBookmarkSolid,
  IconBookmarkLine,
  IconCommonsSolid,
  IconCompleteSolid,
  IconDuplicateLine,
  IconEditLine,
  IconLockLine,
  IconMarkAsReadLine,
  IconMoreLine,
  IconNoSolid,
  IconPeerReviewLine,
  // IconRubricSolid,
  IconSpeedGraderSolid,
  IconTrashLine,
  IconUnlockLine,
  IconUserLine
} from '@instructure/ui-icons'
import {IconButton} from '@instructure/ui-buttons'
import {Menu} from '@instructure/ui-menu'
import {Text} from '@instructure/ui-text'
import {View} from '@instructure/ui-view'

function InfoText({repliesCount, unreadCount}) {
  const infoText = []

  if (repliesCount > 0) {
    infoText.push(
      I18n.t(
        {one: '%{repliesCount} reply', other: '%{repliesCount} replies'},
        {count: repliesCount, repliesCount}
      )
    )
  }

  if (unreadCount > 0) {
    infoText.push(I18n.t('%{unreadCount} unread', {unreadCount}))
  }

  return infoText.length > 0 ? (
    <View padding="0 x-small 0 0">
      <Text weight="light" size="small" data-testid="replies-counter">
        {infoText.join(', ')}
      </Text>
    </View>
  ) : null
}

export function PostToolbar({repliesCount, unreadCount, ...props}) {
  return (
    <>
      <InfoText repliesCount={repliesCount} unreadCount={unreadCount} />
      {props.onTogglePublish && (
        <ToggleButton
          isEnabled={props.isPublished}
          enabledIcon={<IconCompleteSolid />}
          disabledIcon={<IconNoSolid />}
          enabledTooltipText={I18n.t('Unpublish')}
          disabledTooltipText={I18n.t('Publish')}
          enabledScreenReaderLabel={I18n.t('Published')}
          disabledScreenReaderLabel={I18n.t('Unpublished')}
          onClick={props.onTogglePublish}
          interaction={props.canUnpublish ? 'enabled' : 'readonly'}
        />
      )}
      {props.onToggleSubscription && (
        <ToggleButton
          isEnabled={props.isSubscribed}
          enabledIcon={<IconBookmarkSolid />}
          disabledIcon={<IconBookmarkLine />}
          enabledTooltipText={I18n.t('Unsubscribe')}
          disabledTooltipText={I18n.t('Subscribe')}
          enabledScreenReaderLabel={I18n.t('Subscribed')}
          disabledScreenReaderLabel={I18n.t('Unsubscribed')}
          onClick={props.onToggleSubscription}
        />
      )}
      <ToolbarMenu {...props} />
    </>
  )
}

const ToolbarMenu = props => {
  const menuConfigs = useMemo(() => {
    return getMenuConfigs(props).map(config => {
      return renderMenuItem(config)
    })
  }, [props])

  if (menuConfigs.length === 0) {
    return null
  }
  return (
    <Menu
      trigger={
        <IconButton
          size="small"
          screenReaderLabel={I18n.t('Manage Discussion')}
          renderIcon={IconMoreLine}
          withBackground={false}
          withBorder={false}
          data-testid="discussion-post-menu-trigger"
        />
      }
    >
      {menuConfigs}
    </Menu>
  )
}

const getMenuConfigs = props => {
  const options = []
  if (props.onReadAll) {
    options.push({
      key: 'read-all',
      icon: <IconMarkAsReadLine />,
      label: I18n.t('Mark All as Read'),
      selectionCallback: props.onReadAll
    })
  }
  if (props.onEdit) {
    options.push({
      key: 'edit',
      icon: <IconEditLine />,
      label: I18n.t('Edit'),
      selectionCallback: props.onEdit
    })
  }
  if (props.onDelete) {
    options.push({
      key: 'delete',
      icon: <IconTrashLine />,
      label: I18n.t('Delete'),
      selectionCallback: props.onDelete
    })
  }
  if (props.onCloseForComments) {
    options.push({
      key: 'close-comments',
      icon: <IconLockLine />,
      label: I18n.t('Close for Comments'),
      selectionCallback: props.onCloseForComments
    })
  }
  if (props.onOpenForComments) {
    options.push({
      key: 'open-comments',
      icon: <IconUnlockLine />,
      label: I18n.t('Open for Comments'),
      selectionCallback: props.onOpenForComments
    })
  }
  if (props.onSend) {
    options.push({
      key: 'send',
      icon: <IconUserLine />,
      label: I18n.t('Send To...'),
      selectionCallback: props.onSend
    })
  }
  if (props.onCopy) {
    options.push({
      key: 'copy',
      icon: <IconDuplicateLine />,
      label: I18n.t('Copy To...'),
      selectionCallback: props.onCopy
    })
  }
  if (props.onOpenSpeedgrader) {
    options.push({
      key: 'speedGrader',
      icon: <IconSpeedGraderSolid />,
      label: I18n.t('Open in Speedgrader'),
      selectionCallback: props.onOpenSpeedgrader
    })
  }
  /* if (false && props.onShowRubric && !props.onAddRubric) {
    options.push({
      key: 'rubric',
      icon: <IconRubricSolid />,
      label: I18n.t('Show Rubric'),
      selectionCallback: props.onShowRubric
    })
  }
  if (props.onAddRubric) {
    options.push({
      key: 'rubric',
      icon: <IconRubricSolid />,
      label: I18n.t('Add Rubric'),
      selectionCallback: props.onAddRubric
    })
  } */
  if (props.onShareToCommons) {
    options.push({
      key: 'shareToCommons',
      icon: <IconCommonsSolid />,
      label: I18n.t('Share to Commons'),
      selectionCallback: props.onShareToCommons
    })
  }
  if (props.onPeerReviews) {
    options.push({
      key: 'peerReviews',
      icon: <IconPeerReviewLine />,
      label: I18n.t('Peer Reviews'),
      selectionCallback: props.onPeerReviews
    })
  }
  return options
}

const renderMenuItem = ({selectionCallback, icon, label, key}) => (
  <Menu.Item onSelect={selectionCallback} key={key}>
    <Flex>
      <Flex.Item>{icon}</Flex.Item>
      <Flex.Item padding="0 0 0 xx-small">
        <Text>{label}</Text>
      </Flex.Item>
    </Flex>
  </Menu.Item>
)

PostToolbar.propTypes = {
  /**
   * Indicates whether a post can be unpublished.
   */
  canUnpublish: PropTypes.bool,
  /**
   * Behavior for marking the thread as read
   */
  onReadAll: PropTypes.func,
  /**
   * Behavior for deleting the discussion post.
   * Providing this function will result in the menu option being rendered.
   */
  onDelete: PropTypes.func,
  /**
   * Behavior for sending to a recipient.
   * Providing this function will result in the menu option being rendered.
   */
  onSend: PropTypes.func,
  /**
   * Behavior for copying a post.
   * Providing this function will result in the menu option being rendered.
   */
  onCopy: PropTypes.func,
  /**
   * Behavior for editing a post.
   * Providing this function will result in the button being rendered.
   */
  onEdit: PropTypes.func,
  /**
   * Behavior for toggling the published state of the post.
   * Providing this function will result in the button being rendered.
   */
  onTogglePublish: PropTypes.func,
  /**
   * Indicates whether the post is published or unpublished.
   * Which state the publish button is in is dependent on this prop.
   */
  isPublished: PropTypes.bool,
  /**
   * Behavior for toggling the subscription state of the post.
   * Providing this function will result in the button being rendered.
   */
  onToggleSubscription: PropTypes.func,
  /**
   * Indicates whether the user has subscribed to the post.
   * Which state the subscription button is in is dependent on this prop.
   */
  isSubscribed: PropTypes.bool,
  /**
   * Callback to be fired when Speedgrader actions are fired.
   */
  onOpenSpeedgrader: PropTypes.func,
  /**
   * Callback to be fired when Show Rubric action is fired.
   */
  onShowRubric: PropTypes.func,
  /**
   * Callback to be fired when Add Rubric action is fired
   */
  onAddRubric: PropTypes.func,
  /**
   * Callback to be fired when Share to Commons action is fired.
   */
  onShareToCommons: PropTypes.func,
  /**
   * Indicate the replies count associated with the Post.
   */
  repliesCount: PropTypes.number,
  /**
   * Indicate the unread count associated with the Post.
   */
  unreadCount: PropTypes.number,
  /**
   * Callback to be fired when Peer Review action is fired
   */
  onPeerReviews: PropTypes.func,
  /**
   * Callback to be fired when Open for Comments action is fired
   */
  onOpenForComments: PropTypes.func,
  /**
   * Callback to be fired when Close for Comments action is fired
   */
  onCloseForComments: PropTypes.func
}

PostToolbar.defaultProps = {
  repliesCount: 0,
  unreadCount: 0
}

export default PostToolbar
