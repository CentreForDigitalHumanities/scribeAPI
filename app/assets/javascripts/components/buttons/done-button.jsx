const React = require("react");
const GenericButton = require("./generic-button");

module.exports = require('create-react-class')({
  displayName: "DoneButton",

  getDefaultProps() {
    return { label: "Done" };
  },

  render() {
    return (
      <GenericButton label={this.props.label}
        onClick={this.props.onClick}
        major={true}
        className="done"
      />
    );
  }
});
