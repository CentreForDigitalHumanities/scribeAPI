import React from 'react'
import PropTypes from 'prop-types'
import DraggableModal from './draggable-modal'
import GenericButton from './buttons/generic-button'

export default class NoMoreSubjectsModal extends React.Component {
  static defaultProps = {
    header: 'Nothing more to do here'
  }
  static propTypes = {
    project: PropTypes.object.isRequired,
    header: PropTypes.string.isRequired,
    workflowName: PropTypes.string.isRequired
  }

  render = () => {
    let next_workflow = this.props.project.workflowWithMostActives(this.props.workflowName),
      next_href = '/',
      next_label = 'Continue'

    if (next_workflow)
      next_href = '/#/' + next_workflow.name

    else if (this.props.project.downloadable_data) {
      next_href = '/#/data'
      next_label = 'Explore Data'
    }

    return <DraggableModal
      header={this.props.header}
      buttons={<GenericButton label={next_label} href={next_href} />}
    >
      {next_workflow ?
        <p>
          Currently, there are no {this.props.project.term('subject')}s for you to {this.props.workflowName}.
            Try <a href={next_href}>{next_workflow.name.capitalize()}</a> instead!
        </p>

        :
        <div>
          <p>There's nothing more to transcribe in {this.props.project.title}!!  🎉 🎉 🎉
          </p>
          <p>Thank you to all the amazing volunteers who worked on this project.</p>

          {this.props.project.downloadable_data &&
            <p>The {this.props.project.root_subjects_count.toLocaleString()} records can be explored via the <a href="/#/data">Data tab</a>.</p>
          }
        </div>

      }
    </DraggableModal>
  }
}
