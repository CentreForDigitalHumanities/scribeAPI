/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from "react";
import createReactClass from "create-react-class";
import Draggable from "../../../../lib/draggable.jsx";

const RADIUS = 4;
const STROKE_COLOR = "#fff";
const FILL_COLOR = "#000";
const STROKE_WIDTH = 1.5;

const OVERSHOOT = 4;

export default createReactClass({
  displayName: "DragHandle",

  render() {
    const scale =
      (this.props.tool.props.xScale + this.props.tool.props.yScale) / 2;

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
    );
  }
});
