class PasswordsController < Devise::PasswordsController
  respond_to :json

  # don't allow sending another password reset link for the same user
  # within this many seconds:
  @@rate_limit_s = 900 # 15 minutes

  # POST /resource/password
  def create
    email = resource_params["email"]
    user = User.find_by email: email
    if user && user[:reset_password_token] && user[:reset_password_sent_at]
      # prevent sending another password reset link too quickly
      # (might be used to flood someone's mailbox)
      if (Time.now - user[:reset_password_sent_at]) < @@rate_limit_s
        render json: {}, status: 429
        return
      end
    end

    super
  end

  # PUT /resource/password
  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      flash_message = resource.active_for_authentication? ? :updated : :updated_not_active
      resource.after_database_authentication
      sign_in(resource_name, resource)
      render json: {messages: [flash_message]}, status: 204
    else
      render json: {errors: resource.errors}, status: 418
    end
  end
end
