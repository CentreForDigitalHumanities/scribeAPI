import React from 'react'
import { Redirect } from 'react-router-dom'
import { AppContext, requestUserFetch } from './app-context.jsx'

@AppContext
export default class ChangePasswordPage extends React.Component {
  constructor() {
    super()
    this.state = {
      errors: {},
      message: null,
      redirect: false
    }

    this.changePassword = this.changePassword.bind(this)
  }

  changePassword(event) {
    event.preventDefault()
    const data = new FormData(event.target)
    const user = {}
    data.forEach((value, key) => { user[key] = value })
    fetch('/users', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user })
    }).then((response) => {
      requestUserFetch()
      if (response.status === 204) {
        // success: redirect to home or target
        this.setState({ redirect: true })
      } else {
        return response.json()
      }
    }).then((payload) => {
      if (payload) {
        this.setState({ errors:        payload.errors })
      }
    }).catch(() => {
      this.setState({ message: 'Problem occurred. Try again or contact the admin.' })
    })
  }

  showErrors(name) {
    return this.state.errors && this.state.errors[name] && <span className="error-message">{this.state.errors[name].join(<br />)}</span>
  }

  render() {
    if (this.state.redirect) {
      if (this.state.target) {
        window.location = this.state.target
        return
      }
      return <Redirect to="/user" />
    }
    return <div className="page-content login-page">
      <h1>Change Password</h1>
      <div>
        <form onSubmit={this.changePassword}>
          {this.state.message && <span className="error-message">{this.state.message}</span>}
          <label>
            Current Password
            <input type="password" name="current_password" required autoComplete="current-password" />
          </label>
          {this.showErrors('current_password')}
          <label>
            New Password
            <input type="password" name="password" required autoComplete="new-password" />
          </label>
          {this.showErrors('password')}
          <label>
            Password Confirmation
            <input type="password" name="password_confirmation" required autoComplete="new-password" />
          </label>
          {this.showErrors('password_confirmation')}
          <p>
            <button className="major-button">Change Password</button>
          </p>
        </form>
      </div>
    </div>
  }
}
