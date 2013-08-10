task :default => [:deploy]

# Usage: rake preveiw

desc "deploy GitHub:Pages"
task :deploy do
	sh "git commit -a"	
	sh "git checkout gh-pages"
	sh "git merge master"
	sh "git push"
	sh "git checkout master"
end

