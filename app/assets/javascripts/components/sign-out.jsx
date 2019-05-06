import React from 'react'
import { Redirect } from 'react-router-dom'
import { requestUserFetch } from './app-context'

/**
 * Sign out helper for the admin environment
 */
export default function SignOut() {
  fetch('/users/sign_out', {
    method: 'delete',
    dataType: 'json'
  }).then(() => {
    requestUserFetch()
  })

  return <Redirect to="/home" />
}
