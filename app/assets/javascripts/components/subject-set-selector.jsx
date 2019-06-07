/*
 * Author: Alex Hebing @ Digital Humanities Lab (Utrecht University), 2019
 */
import React from 'react'
import PropTypes from 'prop-types'
import DraggableModal from './draggable-modal'
import GenericButton from './buttons/generic-button'

export default class SubjectSetSelector extends React.Component {
  static defaultProps = {
    classes: '',
    doneButtonLabel: 'Give me a random source'
  }

  static contextTypes = {
    router: PropTypes.object
  }

  constructor() {
    super()
    this.state = {
      redirect: false,
      subjectSetId: null
    }
  }

  componentWillMount() {
    const subjectSets = this.props.subjectSets
    if (subjectSets.length === 1) {
      this.onSubjectSetSelected(subjectSets[0].id)
    }
  }

  sortByGroupId(subjectSets) {
    subjectSets.sort(function (a, b) {
      if (a.group_id < b.group_id) { return -1 }
      if (a.group_id > b.group_id) { return 1 }
      return 0
    })
  }

  getSubjectSets(subjectSets) {
    let subjectSetTitles = []
    let currentLanguage

    if (subjectSets.length > 1) {
      this.sortByGroupId(subjectSets)
    }

    for (var i = 0; i < subjectSets.length; i++) {
      let subjectSetId = subjectSets[i].id
      let subjectSetLan = subjectSets[i].meta_data.langs

      // if Mark is navigated to via menu (not a specific language)...
      if (!this.props.group_id) {
        // ... add language headers 
        if (i === 0 || currentLanguage !== subjectSetLan) {
          subjectSetTitles.push(<h6 key={i}>{subjectSetLan}</h6>)
          currentLanguage = subjectSetLan
        }
      }

      subjectSetTitles.push(
        <GenericButton
          key={subjectSets[i].id}
          label={SubjectSetSelector.parseTitle(subjectSets[i].meta_data.set_key)}
          className="ghost small-button selectable-subject-set"
          onClick={() => {
            this.onSubjectSetSelected(subjectSetId)
          }}>
        </GenericButton>)
    }
    return <div>{subjectSetTitles}</div>
  }

  static parseTitle(subjectSetKey) {
    if (subjectSetKey.indexOf('_') != -1) {
      let splitSetKey = subjectSetKey.split('_')
      let author = splitSetKey[0].split('-').join(' ')
      let title = splitSetKey[1].split('-').join(' ')
      return author + '. ' + title + '.'
    } else {
      return subjectSetKey.split('-').join(' ')
    }
  }

  onSelectRandomSubjectSet = () => {
    this.onSubjectSetSelected(undefined)
  }

  onSubjectSetSelected = (subjectSetId) => {
    let { onSelected } = this.props
    onSelected(subjectSetId)
  }

  render() {
    // let { redirect, subjectSetId } = this.state
    const subjectSets = this.props.subjectSets
    // if (redirect) {
    //   this.context.rout
    //   return <Redirect to={`/${this.props.workflow}?subject_set_id=${subjectSetId || ''}`} />
    // }
    return (
      <DraggableModal
        ref="tutorialModal"
        header='Please select a source'
        doneButtonLabel="Give me a random source"
        onDone={this.onSelectRandomSubjectSet}
        width={800}
        classes="help-modal"
        closeButton={true}
        onClose={this.onSelectRandomSubjectSet}>
        <div>
          <p>Please select the source you would like to work on.</p>
          {this.getSubjectSets(subjectSets)}
        </div>
      </DraggableModal>
    )
  }
}
