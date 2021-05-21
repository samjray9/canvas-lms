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

import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {View} from '@instructure/ui-view'
import {Flex} from '@instructure/ui-flex'
import {Link} from '@instructure/ui-link'
import {IconCommentLine} from '@instructure/ui-icons'
import {ScreenReaderContent, PresentationContent} from '@instructure/ui-a11y-content'
import Tray from './Tray'
import I18n from 'i18n!CommentLibrary'

const Library = ({
  comments,
  setComment,
  onAddComment,
  onDeleteComment,
  isAddingComment,
  removedItemIndex
}) => {
  const [isTrayOpen, setIsTrayOpen] = useState(false)

  const handleCommentClick = comment => {
    if (isTrayOpen) {
      setIsTrayOpen(false)
    }
    setComment(comment)
  }

  return (
    <>
      <Flex direction="row-reverse" padding="medium 0 xx-small small">
        <Flex.Item>
          <View as="div" padding="0 0 0 x-small" display="flex">
            <Link
              isWithinText={false}
              onClick={() => setIsTrayOpen(true)}
              renderIcon={<IconCommentLine />}
              iconPlacement="start"
            >
              <ScreenReaderContent>{I18n.t('Open Comment Tray')}</ScreenReaderContent>
              <PresentationContent>{I18n.n(comments.length)}</PresentationContent>
            </Link>
          </View>
        </Flex.Item>
      </Flex>
      <Tray
        isOpen={isTrayOpen}
        comments={comments}
        isAddingComment={isAddingComment}
        onAddComment={onAddComment}
        onItemClick={handleCommentClick}
        onDeleteComment={onDeleteComment}
        setIsOpen={setIsTrayOpen}
        removedItemIndex={removedItemIndex}
      />
    </>
  )
}

Library.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      comment: PropTypes.string.isRequired,
      _id: PropTypes.string.isRequired
    })
  ).isRequired,
  setComment: PropTypes.func.isRequired,
  isAddingComment: PropTypes.bool.isRequired,
  onAddComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  removedItemIndex: PropTypes.number
}

export default Library
