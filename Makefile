


clean:
	rm -f *.pyc

work:
	emacs -nw templates/chapter* js/paragraph.js

build:
	python3 build.py > temp.html
	./reload-chrome.sh

just-build:
	python3 build.py > temp.html
