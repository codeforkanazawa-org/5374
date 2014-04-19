task :default => [:deploy]

# Usage: rake preveiw

desc "Get CSV Data"
task :csv do
	sh 'wget -O data.csv "https://docs.google.com/spreadsheet/pub?key=0Au5M9QAsSoVbdEtoQmFoX3dEcU5LODRYU1ZPT3E0TXc&output=csv"'
end

desc "deploy GitHub:Pages"
task :deploy do
	system "git commit -a"	
	sh "git checkout gh-pages"
	sh "git merge master"
	sh "git push"
	sh "git checkout master"
end

