import React from 'react'
import pluralize from 'pluralize'

import GenericButton from './buttons/generic-button.jsx'
import API from '../lib/api.jsx'
import { AppContext } from './app-context.jsx'

@AppContext
export default class GroupPage extends React.Component {
  constructor() {
    super()
    this.state = { group: null }
  }

  componentDidMount() {
    API.type('groups')
      .get(this.props.match.params.group_id)
      .then(group => {
        this.setState({
          group
        })
      })

    API.type('subject_sets')
      .get({ group_id: this.props.match.params.group_id })
      .then(sets => {
        this.setState({
          subject_sets: sets
        })
      })
  }

  renderStats = (pending, finished, pendingText, finishedText, completionText) =>
    <dl className="stats-list">
      {pendingText && <div>
        <dt>{pendingText}</dt>
        <dd>
          {pending || 0}
        </dd>
      </div>}
      {finishedText && <div>
        <dt>{finishedText}</dt>
        <dd>
          {finished || 0}
        </dd>
      </div>}
      {completionText && <div className="completion">
        <dt>{completionText}</dt>
        <dd>
          {pending || finished ? parseInt((pending / (pending + finished)) * 100) : 0} %
        </dd>
      </div>}
    </dl>

  render() {
    if (this.state.group == null) {
      return (
        <div className="group-page">
          <h2>Loading...</h2>
        </div>
      )
    }
    const termsMap = this.props.context.project.terms_map
    let subjectsTerm = termsMap.subject
    subjectsTerm = pluralize(subjectsTerm[0].toUpperCase() + subjectsTerm.substring(1))
    return (
      <div className="page-content">
        <h1>{this.state.group.name}</h1>
        <div className="group-page">
          <div className="group-information">
            <h3>{this.state.group.description}</h3>
            <dl className="metadata-list">
              {(() => {
                const result = []
                for (let k in this.state.group.meta_data) {
                  // Is there another way to return both dt and dd elements without wrapping?
                  const v = this.state.group.meta_data[k]
                  if (
                    [
                      'key',
                      'description',
                      'cover_image_url',
                      'external_url',
                      'retire_count'
                    ].indexOf(k) < 0
                  ) {
                    result.push(
                      <div key={k}>
                        <dt>{k.replace(/_/g, ' ')}</dt>
                        <dd>{v}</dd>
                      </div>
                    )
                  }
                }

                return result
              })()}
              {this.state.group.meta_data.external_url != null &&
                <div>
                  <dt>External Resource</dt>
                  <dd>
                    <a
                      href={this.state.group.meta_data.external_url}
                      target="_blank"
                    >
                      {this.state.group.meta_data.external_url}
                    </a>
                  </dd>
                </div>}
            </dl>
            <img
              className="group-image"
              src={this.state.group.cover_image_url}
            />
          </div>
          <div className="group-stats">
            {this.props.context.project.show_total_group_subjects_count &&
              this.state.group.stats &&
              <div>
                {this.renderStats(
                  this.state.group.stats && this.state.group.stats.total_pending || 0,
                  this.state.group.stats && this.state.group.stats.total_finished || 0,
                  `${subjectsTerm} Remaining`,
                  `Completed ${subjectsTerm}`,
                  'Overall Estimated Completion')}
              </div>}
            {this.state.group.stats && this.state.group.stats.workflow_counts &&
              this.props.context.project.workflows.map((workflow) => {
                const pendingText = termsMap[`${workflow.name}_pending`],
                  finishedText = termsMap[`${workflow.name}_finished`]
                const counts = this.state.group.stats.workflow_counts[workflow.id]
                if (counts) {
                  return <div key={workflow.id}>
                    {this.renderStats(
                      counts.active_subjects + counts.inactive_subjects,
                      counts.complete_subjects,
                      pendingText,
                      finishedText)}
                  </div>
                }
              })
            }
            <div className="subject_sets">
              {(
                this.state.subject_sets != null ? this.state.subject_sets : []
              ).map((set, i) => (
                <div key={i} className="subject_set">
                  <div className="mark-transcribe-buttons">
                    {(() => {
                      const result1 = []
                      for (let workflow of this.props.context.project.workflows) {
                        const workflowCounts = set.counts[workflow.id]
                        if ((workflowCounts && workflowCounts.active_subjects ||
                          0) > 0) {
                          result1.push(
                            <GenericButton
                              key={workflow.id}
                              label={workflow.name}
                              to={`/${workflow.name}?subject_set_id=${
                                set.id}`}
                            />
                          )
                        } else {
                          result1.push(undefined)
                        }
                      }

                      return result1
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
