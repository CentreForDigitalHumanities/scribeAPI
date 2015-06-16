 # @cjsx React.DOM

React                         = require 'react'
SubjectViewer                 = require './subject-viewer'
{Router, Routes, Route, Link} = require 'react-router'
SVGImage                      = require './svg-image'
Draggable                     = require '../lib/draggable'
LoadingIndicator              = require './loading-indicator'
SubjectMetadata               = require './subject-metadata'
ActionButton                  = require './action-button'
markingTools                  = require './mark/tools'

module.exports = React.createClass
  displayName: 'SubjectSetViewer'
  resizing: false

  getInitialState: ->
    subject_set: @props.subject_set
    tool: @props.tool
    subject_set_index: @props.subject_set_index

  advancePrevious: ->
    @advance -1

  advanceNext: ->
    @advance 1

  advance: (count) ->
    new_index = @state.subject_set_index + count
    return if new_index < 0 || new_index >= @props.subject_set.subjects.length

    @setState subject_set_index: new_index, () =>
      @props.onViewSubject? @props.subject_set.subjects[@state.subject_set_index]


  render: ->
    console.log " SSV Render @props", @props
    console.log " SSV Render @state", @state
    <div className="subject-set-viewer">
      <div className="subject-set-nav">
        <ActionButton text="Previous" onClick={@advancePrevious} className={if @props.subject_set_index == 0 then 'disabled' else ''}/>
        <ActionButton text="Next" onClick={@advanceNext} className={if @props.subject_set_index == @props.subject_set.subjects.length-1 then 'disabled' else ''} />
      </div>
      { for subject, index in @props.subject_set.subjects
        console.log "SSV subject", subject
        <SubjectViewer
          key={index}
          subject={subject}
          workflow={@props.workflow}
          task={@props.task}
          annotation={@props.annotation}
          active={index == @props.subject_set_index}
          onComplete={@props.onComplete}
          onChange={@props.onChange}
        />
      }
    </div>

window.React = React
