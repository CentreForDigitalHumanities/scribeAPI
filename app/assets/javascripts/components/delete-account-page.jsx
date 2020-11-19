import React from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'
import { AppContext, requestUserFetch } from './app-context'
import { getCsrfHeaders } from '../lib/csrf'

@AppContext
export default class DeleteAccountPage extends React.Component {
  constructor() {
    super()
    this.state = {
      deleted: false,
      loading: false
    }

    this.delete = this.delete.bind(this)
  }

  delete() {
    this.setState({ loading: true })
    fetch('/delete_user', {
      method: 'POST',
      headers: getCsrfHeaders(),
    }).then((response) => {
      this.setState({ loading: false })
      if (response.status === 204) {
        this.setState({
          deleted: true
        })
        // give the server some time to actually delete the account
        requestUserFetch()
      } else {
        alert('Something went wrong deleting your account. Please try again or contact support.')
      }
    })
  }

  renderContent() {
    if (this.state.deleted) {
      return <p>Your account has been deleted. Thank you for your contributions!</p>
    }

    if (!this.props.context.user) {
      return <p><NavLink to="/login">Login</NavLink> to delete your account.</p>
    }

    return <div>
      <p>Would you like to delete your account? <strong>This cannot be undone!</strong></p>
      <p>
        <button onClick={this.delete} className={classNames('major-button', { 'is-loading': this.state.loading })}>Yes</button>
        &nbsp;
        <NavLink to="/user" className="major-button">No</NavLink>
      </p>
    </div>
  }

  render() {
    return <div className="page-content user-page">
      <h1>Delete Account</h1>
      <div>
        {this.renderContent()}
      </div>
    </div>
  }
}
