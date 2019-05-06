import React from 'react'
import { NavLink } from 'react-router-dom'
import { AppContext, requestUserFetch } from './app-context'

@AppContext
export default class DeleteAccountPage extends React.Component {
  constructor() {
    super()
    this.state = {
      deleted: false
    }

    this.delete = this.delete.bind(this)
  }

  delete() {
    fetch('/delete_user', {
      method: 'POST'
    }).then((response) => {
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
        <button onClick={this.delete} className="major-button">Yes</button>
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
