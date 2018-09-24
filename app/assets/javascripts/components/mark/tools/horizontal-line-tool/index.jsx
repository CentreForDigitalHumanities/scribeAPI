import React from 'react';
import createReactClass from "create-react-class";
import PropTypes from 'prop-types';
import Draggable from "../../../../lib/draggable.jsx";
import DeleteButton from "../../../../components/buttons/delete-mark.jsx";
import MarkButtonMixin from "../../../../lib/mark-button-mixin.jsx";

const STROKE_WIDTH = 10
const DEFAULT_WIDTH = 1000
const DELETE_BUTTON_DISTANCE_X = 12
const DELETE_BUTTON_DISTANCE_Y = 0

export default createReactClass({
  displayName: 'HorizontalLineTool',

  mixins: [MarkButtonMixin],

  propTypes: {
    // key:  PropTypes.number.isRequired
    mark: PropTypes.object.isRequired
  },
  initCoords: null,

  statics: {
    defaultValues: ({ x, y }) => ({
      x: 0,
      y: y,
      width: DEFAULT_WIDTH,
      height: 0
    }),

    initStart: ({ x, y }, mark) => {
      x = 0
      this.initCoords = { x, y }
      return { x, y }
    },

    initMove: (cursor, mark) => {
      let width, height, x, y
      if (cursor.x > this.initCoords.x) {
        width = cursor.x - mark.x
        x = 0
      } else {
        width = this.initCoords.x - cursor.x
        x = 0
      }
      if (cursor.y > this.initCoords.y) {
        height = cursor.y - mark.y
        y = mark.y
      } else {
        height = this.initCoords.y - cursor.y
        y = cursor.y
      }

      return { x, y, width, height }
    },
    initValid: (mark) =>
      true,

    /**
     * This callback is called on mouseup to override mark properties (e.g. if too small)
     */
    initRelease: (coords, mark, e) => {
      mark.width = Math.max(mark.width, DEFAULT_WIDTH)
      mark.height = STROKE_WIDTH
      return mark
    },
  },
  getInitialState() {
    let mark = this.props.mark
    if (mark.status == null) {
      mark.status = 'mark'
    }

    return {
      mark: mark,
      buttonDisabled: false,
      lockTool: false
    }
  },

  handleMainDrag(e, d) {
    if (this.state.locked) {
      return
    }
    if (this.props.disabled) {
      return
    }
    this.props.mark.x += d.x / this.props.xScale
    this.props.mark.y += d.y / this.props.yScale
    this.assertBounds()
    return this.props.onChange(e);
  },

  assertBounds() {
    this.props.mark.x = 0

    this.props.mark.y = Math.min(this.props.sizeRect.attributes.height.value - this.props.mark.height, this.props.mark.y)
    this.props.mark.y = Math.max(0, this.props.mark.y)

    this.props.mark.width = this.props.sizeRect.attributes.width.value
    this.props.mark.height = STROKE_WIDTH
  },
  validVert(y, h) {
    return y >= 0 && y + h <= this.props.sizeRect.attributes.height.value
  },
  validHoriz(x, w) {
    return x >= 0 && x + w <= this.props.sizeRect.attributes.width.value
  },
  getDeleteButtonPosition() {
    let points = [this.props.mark.x + this.props.mark.width, this.props.mark.y],
      x = points[0] + DELETE_BUTTON_DISTANCE_X / this.props.xScale,
      y = points[1] + DELETE_BUTTON_DISTANCE_Y / this.props.yScale
    x = Math.min(x, this.props.sizeRect.attributes.width.value - 15 / this.props.xScale),
      y = Math.max(y, 15 / this.props.yScale)
    return { x, y }
  },
  getMarkButtonPosition() {
    let points = [this.props.mark.x + this.props.mark.width, this.props.mark.y + this.props.mark.height]
    return {
      x: Math.min(points[0], this.props.sizeRect.attributes.width.value - 40 / this.props.xScale),
      y: Math.min(points[1] + 20 / this.props.yScale, this.props.sizeRect.attributes.height.value - 15 / this.props.yScale)
    }
  },
  handleMouseDown() {
    this.props.onSelect(this.props.mark)
  },
  normalizeMark() {
    if (this.props.mark.width < 0) {
      this.props.mark.x += this.props.mark.width
      this.props.mark.width *= -1
    }
    if (this.props.mark.height < 0) {
      this.props.mark.y += this.props.mark.height
      this.props.mark.height *= -1
    }
    return this.props.onChange()
  },
  render() {
    let classes = []
    if (this.props.isTranscribable) {
      classes.push('transcribable')
    }
    if (this.props.interim) {
      classes.push('interim')
    }
    classes.push(this.props.disabled ? 'committed' : 'uncommitted')
    if (this.checkLocation()) {
      classes.push("tanscribing")
    }

    let x1 = this.props.mark.x,
      width = this.props.mark.width,
      x2 = x1 + width,
      y1 = this.props.mark.y,
      height = STROKE_WIDTH,
      y2 = y1 + height,

      x = this.props.mark.x,
      y = this.props.mark.y,

      scale = (this.props.xScale + this.props.yScale) / 2,

      points = [
        [x1, y1].join(','),
        [x2, y1].join(','),
        [x2, y2].join(','),
        [x1, y2].join(','),
        [x1, y1].join(',')
      ].join('\n')

    let deleteButtonPos
    return (
      <g
        data-tool={this}
        onMouseDown={this.props.onSelect}
        title={this.props.mark.label}
      >
        <g
          className={`horizontal-line-tool${this.props.disabled ? ' locked' : ''}`}
        >

          <Draggable onDrag={this.handleMainDrag} >
            <g
              className={`tool-shape ${classes.join(' ')}`}
              key={points}
              dangerouslySetInnerHTML={{
                __html: `
                <filter id=\"dropShadow\">
                  <feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"3\" />
                  <feOffset dx=\"2\" dy=\"4\" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in=\"SourceGraphic\" />
                  </feMerge>
                </filter>

                <rect
                  fill=\"${this.props.mark.color || "gray"}\"
                  x=\"${x}\"
                  y=\"${y}\"
                  width=\"${width}\"
                  height=\"${height}\"
                  filter=\"${this.props.selected ? 'url(#dropShadow)' : 'none'}\"
                />
              `
              }}
            />

          </Draggable>

          {this.props.selected &&
            (deleteButtonPos = this.getDeleteButtonPosition()) &&
            <DeleteButton onClick={this.props.onDestroy} scale={scale} x={deleteButtonPos.x} y={deleteButtonPos.y} />
          }

          { // REQUIRES MARK-BUTTON-MIXIN
            (this.props.selected || this.state.markStatus == 'transcribe-enabled') &&
            this.props.isTranscribable && this.renderMarkButton()
          }

        </g>

      </g>
    )
  }
});
