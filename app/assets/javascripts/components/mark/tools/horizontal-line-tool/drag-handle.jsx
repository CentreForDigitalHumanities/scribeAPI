React = require('react')
const createReactClass = require("create-react-class");
Draggable = require("../../../../lib/draggable.jsx")

RADIUS = 4
STROKE_COLOR = '#fff'
FILL_COLOR = '#000'
STROKE_WIDTH = 1.5

OVERSHOOT = 4

module.exports = createReactClass({
  displayName: 'DragHandle',

  render() {
    const scale = (this.props.tool.props.xScale + this.props.tool.props.yScale) / 2

    return (
      <Draggable onDrag={this.props.onDrag} onEnd={this.props.onEnd}>
        <g
          fill={FILL_COLOR}
          stroke={STROKE_COLOR}
          strokeWidth={STROKE_WIDTH / scale}
        >
          <circle
            className="mark-tool resize-button"
            r={RADIUS / scale}
            cx={`${this.props.x}`}
            cy={`${this.props.y}`}
          />
        </g>
      </Draggable>
    )
  }
});
