import React from 'react'
import PropTypes from 'prop-types'

export default class Login extends React.Component {
  constructor() {
    super()
    this.state = { error: null }
    this.signOut = this.signOut.bind(this)
  }

  static defaultProps = {
    user: null,
    onLogout: () => { },
    loginProviders: []
  }

  static propTypes = {
    user: PropTypes.object,
    onLogout: PropTypes.func,
    loginProviders: PropTypes.arrayOf(PropTypes.object)
  }

  render() {
    return (
      <div className="login">
        {this.props.user && (this.props.user.guest
          ? this.renderLoggedInAsGuest()
          : this.props.user.name && this.renderLoggedIn())
          || this.renderLoginOptions('Log In:')}
      </div>
    )
  }

  signOut(e) {
    e.preventDefault()
    return fetch('/users/sign_out', {
      method: 'delete',
      dataType: 'json'
    }).then(() => {
      return this.props.onLogout()
    }).catch(() => {
      return this.setState({
        error: 'Could not log out'
      })
    })
  }

  renderLoggedInAsGuest() {
    return (
      <span>
        {this.renderLoginOptions('Log in to save your work:')}
      </span>
    )
  }

  renderLoggedIn() {
    return (
      <span className="login-container">
        {this.props.user.avatar &&
          <img src={`${this.props.user.avatar}`} />}
        <span className="label">Hello {this.props.user.name} </span>
        <a className="logout" onClick={this.signOut}>
          Logout
        </a>
      </span>
    )
  }

  renderLoginOptions(label = 'Log In:') {
    const getLinkId = (link) => link.id === 'zooniverse' ? 'dot-circle-o' : link.id
    const getLink = (provider, content, className) => {
      return (
        <a
          key={`login-link-${provider.id}`}
          href={provider.path}
          title={`Log in using ${provider.name}`}
          className={className}
        >
          {content}
        </a>
      )
    }

    if (this.props.loginProviders.length == 1) {
      // make the whole button clickable
      return getLink(
        this.props.loginProviders[0],
        <div>
          <span className="label">{label}</span>
          <div className="options">
            <i className={`fa fa-${getLinkId(this.props.loginProviders[0])} fa-2`} />
          </div>
        </div>,
        'main-header-item login-container')
    }

    const links = this.props.loginProviders.map((provider) =>
      getLink(provider, <i className={`fa fa-${getLinkId(provider)} fa-2`} />))

    return (
      <span className="login-container">
        <span className="label">{label}</span>
        <div className="options">{links}</div>
      </span>
    )
  }
}
