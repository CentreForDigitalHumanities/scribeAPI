/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const React = require("react");
const SmallButton = require("./small-button");

module.exports = require('create-react-class')({
  displayName: "BadSubjectButton",

  render() {
    const label =
      this.props.label != null
        ? this.props.label
        : this.props.active
          ? "Bad Subject"
          : "Bad Subject?";

    const additional_classes = [];
    if (this.props.active) {
      additional_classes.push("toggled");
    }
    if (this.props.className != null) {
      additional_classes.push(this.props.className);
    }
    return (
      <SmallButton
        key="bad-subject-button"
        label={label}
        onClick={this.props.onClick}
        className={`ghost toggle-button ${additional_classes.join(" ")}`}
      />
    );
  }
});
