class HomeController < ApplicationController
  caches_action :index, :layout => false, :cache_path => "home/index"

  def index
  end
end
