# @cjsx React.DOM
React                   = require 'react'
SubjectViewer           = require '../subject-viewer'
JSONAPIClient           = require 'json-api-client' # use to manage data?
FetchSubjectsMixin      = require 'lib/fetch-subjects-mixin'
ForumSubjectWidget      = require '../forum-subject-widget'

BaseWorkflowMethods     = require 'lib/workflow-methods-mixin'

# Hash of core tools:
coreTools               = require 'components/core-tools'

# Hash of transcribe tools:
transcribeTools         = require './tools'

RowFocusTool            = require '../row-focus-tool'
API                     = require '../../lib/api'

module.exports = React.createClass # rename to Classifier
  displayName: 'Transcribe'
  mixins: [FetchSubjectsMixin, BaseWorkflowMethods] # load subjects and set state variables: subjects,  classification

  getInitialState: ->
    taskKey:                      null
    classifications:              []
    classificationIndex:          0
    subject_index:                0

  getDefaultProps: ->
    workflowName: 'transcribe'

  componentWillMount: ->
    @beginClassification()

  fetchSubjectsCallback: ->
    @setState taskKey: @getCurrentSubject().type if @getCurrentSubject()?

  handleTaskComponentChange: (val) ->
    # console.log "handleTaskComponentChange val", val
    taskOption = @getCurrentTask().tool_config.options[val]
    if taskOption.next_task?
      @advanceToTask taskOption.next_task

  # Handle user selecting a pick/drawing tool:
  handleDataFromTool: (d) ->
    classifications = @state.classifications
    currentClassification = classifications[@state.classificationIndex]

    # this is a source of conflict. do we copy key/value pairs, or replace the entire annotation? --STI
    currentClassification.annotation[k] = v for k, v of d

    @forceUpdate()
    @setState
      classifications: classifications,
        => @forceUpdate()

  handleTaskComplete: (d) ->
    @handleDataFromTool(d)
    @commitClassificationAndContinue d

  handleViewerLoad: (props) ->
    # console.log "Transcribe#handleViewerLoad: setting size: ", props
    @setState
      viewerSize: props.size

    if (tool = @refs.taskComponent)?
      tool.onViewerResize props.size

  makeBackHandler: ->
    () =>
      console.log "go back"

  render: ->
    # DISABLE ANIMATED SCROLLING FOR NOW
    # if @props.query.scrollX? and @props.query.scrollY?
    #   window.scrollTo(@props.query.scrollX,@props.query.scrollY)
    # console.log "transcribe#index @props", @props 
    # console.log "transcribe#index @state", @state 
    currentAnnotation = @getCurrentClassification().annotation
    TranscribeComponent = @getCurrentTool() # @state.currentTool
    console.log "TranscribeComponent", TranscribeComponent
    onFirstAnnotation = currentAnnotation?.task is @getActiveWorkflow().first_task

    <div className="classifier">
      <div className="subject-area">

        { if ! @getCurrentSubject()
            <div className="workflow-nothing-more">
              { if @state.noMoreSubjects
                <h1>You transcribed them all!</h1>
              }
              <p>There are currently no transcription subjects. Try <a href="/#/mark">marking</a> instead!</p>
            </div>

          else if @getCurrentSubject()? and @getCurrentTask()?
            <SubjectViewer
              onLoad={@handleViewerLoad}
              subject={@getCurrentSubject()}
              active=true
              workflow={@getActiveWorkflow()}
              classification={@props.classification}
              annotation={currentAnnotation}
            >
              <TranscribeComponent
                viewerSize={@state.viewerSize}
                annotation_key={@state.taskKey}
                task={@getCurrentTask()}
                annotation={currentAnnotation}
                subject={@getCurrentSubject()}
                onChange={@handleDataFromTool}
                subjectCurrentPage={@props.query.page}
                onComplete={@handleTaskComplete}
                onBack={@makeBackHandler()}
                workflow={@getActiveWorkflow()}
                viewerSize={@state.viewerSize}
                transcribeTools={transcribeTools}
              />

            </SubjectViewer>
        }
      </div>

      { if @getCurrentTask()? and @getCurrentSubject()
          nextTask =
            if @getCurrentTask().tool_config.options?[currentAnnotation.value]?
              @getCurrentTask().tool_config.options?[currentAnnotation.value].next_task
            else
              @getCurrentTask().next_task

          <div className="task-area">

            <div className="task-container" style={display: "none"} >
              <nav className="task-nav">
                <button type="button" className="back minor-button" disabled={onFirstAnnotation} onClick={@destroyCurrentAnnotation}>Back</button>
                { if nextTask?
                    <button type="button" className="continue major-button" onClick={@advanceToNextTask.bind(@, nextTask)}>Next</button>
                  else
                    <button type="button" className="continue major-button" onClick={@completeClassification}>Done</button>
                }
              </nav>
            </div>

            <div className="forum-holder">
              <ForumSubjectWidget subject=@getCurrentSubject() />
            </div>

          </div>
      }
    </div>

window.React = React
