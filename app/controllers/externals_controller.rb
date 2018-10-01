require 'net/http'

class ExternalsController < ApplicationController
  respond_to :json

  def search
    externals = Project.current.externals
    external = externals.find_by(id: params[:id])

    filled_uri = ''
    last_index = 0

    # replace all the placeholders in the uri from the project definition
    base_uri = external[:uri]
    base_uri.scan(/\{((?<env>env:)|)(?<key>[^\}]+)\}/) do |match|
      filled_uri << base_uri[last_index..match.begin(0)]
      last_index = match.end(0)
      # TODO: escape?
      if match[:env].nil?
        filled_uri << params[ENV[:key]]
      else
        filled_uri << params[match[:key]]
      end
    end
    filled_uri << base_uri[last_index..-1]

    response = Net::HTTP.get(URI(filled_uri))

    mapped = []
    response do |item|
      mapped << {
        "id" => response[external[:id_field]],
        "display" => response[external[:display_field]],
      }
    end

    render json: mapped
  end

end
