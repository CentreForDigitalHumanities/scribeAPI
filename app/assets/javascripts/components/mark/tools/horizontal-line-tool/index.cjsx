React           = require 'react'
Draggable       = require 'lib/draggable'
DragHandle      = require './drag-handle'
DeleteButton    = require 'components/buttons/delete-mark'
MarkButtonMixin = require 'lib/mark-button-mixin'

STROKE_WIDTH = 10
DEFAULT_WIDTH = 1000
DELETE_BUTTON_ANGLE = 45
DELETE_BUTTON_DISTANCE_X = 12
DELETE_BUTTON_DISTANCE_Y = 0
DEBUG = false

module.exports = React.createClass
  displayName: 'HorizontalLineTool'

  mixins: [MarkButtonMixin]

  propTypes:
    # key:  React.PropTypes.number.isRequired
    mark: React.PropTypes.object.isRequired

  initCoords: null

  statics:
    defaultValues: ({x, y}) ->
      x: 0
      y: y
      width: DEFAULT_WIDTH
      height: 0

    initStart: ({x,y}, mark) ->
      x = 0
      @initCoords = {x,y}
      {x,y}

    initMove: (cursor, mark) ->
      if cursor.x > @initCoords.x
        width = cursor.x - mark.x
        x = 0
      else
        width = @initCoords.x - cursor.x
        x = 0

      if cursor.y > @initCoords.y
        height = cursor.y - mark.y
        y = mark.y
      else
        height = @initCoords.y - cursor.y
        y = cursor.y

      {x, y, width, height}

    initValid: (mark) ->
      true

    # This callback is called on mouseup to override mark properties (e.g. if too small)
    initRelease: (coords, mark, e) ->
      mark.width = Math.max mark.width, DEFAULT_WIDTH
      mark.height = STROKE_WIDTH
      mark

  getInitialState: ->
    mark = @props.mark
    unless mark.status?
      mark.status = 'mark'
    mark: mark
    # set up the state in order to caluclate the polyline as horizontal line
    x1 = 0
    x2 = x1 + @props.mark.width
    y1 = @props.mark.y
    y2 = y1 + @props.mark.height

    buttonDisabled: false
    lockTool: false

  handleMainDrag: (e, d) ->
    return if @state.locked
    return if @props.disabled
    @props.mark.x += d.x / @props.xScale
    @props.mark.y += d.y / @props.yScale
    @assertBounds()
    @props.onChange e

  assertBounds: ->
    @props.mark.x = 0

    @props.mark.y = Math.min @props.sizeRect.props.height - @props.mark.height, @props.mark.y
    @props.mark.y = Math.max 0, @props.mark.y

    @props.mark.width = @props.sizeRect.props.width
    @props.mark.height = STROKE_WIDTH

  validVert: (y,h) ->
    y >= 0 && y + h <= @props.sizeRect.props.height

  validHoriz: (x,w) ->
    x >= 0 && x + w <= @props.sizeRect.props.width

  getDeleteButtonPosition: () ->    
    points = [@props.mark.x + @props.mark.width, @props.mark.y]
    x = points[0] + DELETE_BUTTON_DISTANCE_X / @props.xScale
    y = points[1] + DELETE_BUTTON_DISTANCE_Y / @props.yScale
    x = Math.min x, @props.sizeRect.props.width - 15 / @props.xScale
    y = Math.max y, 15 / @props.yScale
    {x, y}

  getMarkButtonPosition: ()->
    points = [@props.mark.x + @props.mark.width, @props.mark.y + @props.mark.height]
    x: Math.min points[0], @props.sizeRect.props.width - 40 / @props.xScale
    y: Math.min points[1] + 20 / @props.yScale, @props.sizeRect.props.height - 15 / @props.yScale

  handleMouseDown: ->
    @props.onSelect @props.mark

  normalizeMark: ->
    if @props.mark.width < 0
      @props.mark.x += @props.mark.width
      @props.mark.width *= -1

    if @props.mark.height < 0
      @props.mark.y += @props.mark.height
      @props.mark.height *= -1

    @props.onChange()

  render: ->
    classes = []
    classes.push 'transcribable' if @props.isTranscribable
    classes.push 'interim' if @props.interim
    classes.push if @props.disabled then 'committed' else 'uncommitted'
    classes.push "tanscribing" if @checkLocation()

    x1 = @props.mark.x
    width = @props.mark.width
    x2 = x1 + width
    y1 = @props.mark.y
    height = STROKE_WIDTH
    y2 = y1 + height

    x = @props.mark.x
    y = @props.mark.y

    scale = (@props.xScale + @props.yScale) / 2

    points = [
      [x1, y1].join ','
      [x2, y1].join ','
      [x2, y2].join ','
      [x1, y2].join ','
      [x1, y1].join ','
    ].join '\n'

    <g
      tool={this}
      onMouseDown={@props.onSelect}
      title={@props.mark.label}
    >
      <g
        className="horizontal-line-tool#{if @props.disabled then ' locked' else ''}"
      >

        <Draggable onDrag = {@handleMainDrag} >
          <g
            className="tool-shape #{classes.join ' '}"
            key={points}
            dangerouslySetInnerHTML={
              __html: "
                <filter id=\"dropShadow\">
                  <feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"3\" />
                  <feOffset dx=\"2\" dy=\"4\" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in=\"SourceGraphic\" />
                  </feMerge>
                </filter>

                <rect
                  fill=\"#{@props.mark.color || "gray"}\"
                  x=\"#{x}\"
                  y=\"#{y}\"
                  width=\"#{width}\"
                  height=\"#{height}\"
                  filter=\"#{if @props.selected then 'url(#dropShadow)' else 'none'}\"
                />
              "
            }
          />

        </Draggable>

        { if @props.selected
            deleteButtonPos = @getDeleteButtonPosition()
            <DeleteButton onClick={@props.onDestroy} scale={scale} x={deleteButtonPos.x} y={deleteButtonPos.y}/>
        }

        { # REQUIRES MARK-BUTTON-MIXIN
          if @props.selected or @state.markStatus is 'transcribe-enabled'
            @renderMarkButton() if @props.isTranscribable
        }

      </g>

    </g>
