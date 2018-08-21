
const React = require("react");

const TranscribeInput = require('create-react-class')({
  displayName: "TranscribeInput",

  render() {
    let classes;
    if (this.props.task.key === this.props.currentStep) {
      classes = "input-field active";
    } else {
      classes = "input-field";
    }

    return (
      <div className={classes}>
        {this.props.task.type !== "textarea" ? (
          <div>
            <label>{this.props.task.instruction}</label>
            <input
              className="transcribe-input"
              type={this.props.task.type}
              placeholder={this.props.task.label}
            />
          </div>
        ) : (
          <textarea className="transcribe-input" placeholder={this.props.task.instruction} />
        )}
      </div>
    );
  }
});

module.exports = TranscribeInput;
