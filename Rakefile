task :default => [:deploy]

desc "deploy GitHub:Pages"
task :deploy do
  system "git commit -a"
  sh "git checkout gh-pages"
  sh "git merge master"
  sh "git push"
  sh "git checkout master"
end

desc "preview website"
task :preview do
  require "webrick"
  WEBrick::HTTPServer.new(:DocumentRoot => ".", :Port => 4000).start
end
