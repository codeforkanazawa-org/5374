use Rack::Static, :index => 'index.html'
run Rack::Directory.new(File.dirname(__FILE__))
