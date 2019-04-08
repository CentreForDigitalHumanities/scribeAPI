import React from 'react'

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

  renderLoginOptions(label) {
    const links = this.props.loginProviders.map((link) => {
      const icon_id = link.id === 'zooniverse' ? 'dot-circle-o' : link.id
      return (
        <a
          key={`login-link-${link.id}`}
          href={link.path}
          title={`Log in using ${link.name}`}
        >
          <i className={`fa fa-${icon_id} fa-2`} />
        </a>
      )
    })

    return (
      <span className="login-container">
        <span className="label">{label || 'Log In:'}</span>
        <div className="options">{links}</div>
      </span>
    )
  }
}
