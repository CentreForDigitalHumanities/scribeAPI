import React from 'react'
import { Redirect } from 'react-router-dom'
import { AppContext, requestUserFetch } from './app-context.jsx'

@AppContext
export default class LoginPage extends React.Component {
  constructor() {
    super()
    this.state = {
      message: null,
      redirect: false
    }
    if (document.referrer) {
      const url = new URL(document.referrer)
      if (url.host === window.location.host) {
        this.state.target = url.pathname.endsWith('admin/signin') ? '/admin' : url.pathname
      }
    }

    this.signIn = this.signIn.bind(this)
  }

  signIn(event) {
    event.preventDefault()
    const data = new FormData(event.target)
    fetch('/users/sign_in', {
      method: 'POST',
      body: data,
    }).then((response) => {
      requestUserFetch()
      if (response.status === 200) {
        // success: redirect to home or target
        this.setState({ redirect: true })
      } else {
        // invalid credentials: show message
        this.setState({ message: 'Invalid email or password, check your credentials and try again.' })
      }
    }).catch(() => {
      this.setState({ message: 'Problem occurred. Try again or contact the admin.' })
    })
  }

  render() {
    if (this.state.redirect) {
      if (this.state.target) {
        window.location = this.state.target
        return
      }
      return <Redirect to="/home" />
    }
    return <div className="page-content login-page">
      <h1>Login</h1>
      <div>
        <form onSubmit={this.signIn}>
          {this.state.message && <span className="error-message">{this.state.message}</span>}
          <label>
            Email
            <input type="email" name="email" />
          </label>
          <label>
            Password
            <input type="password" name="password" />
          </label>
          <p>
            <button className="major-button">Sign In</button>
          </p>
        </form>
      </div>
    </div>
  }
}
