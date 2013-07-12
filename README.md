This Tab Will Self Destruct™
============================

An extension for Chrome that automatically cleans up unused tabs to keep your 
browser snappy.

Installation
------------

This extension is now available from the Chrome Web Store.

You can also install it manually if you wish by downloading either the 
[temporary-tab.crx](https://github.com/drzax/chrome-temporary-tabs/blob/release/temporary-tab.crx?raw=true) file from 
the release branch of this repository then install by dragging onto the 
[Chrome extensions window](http://support.google.com/chrome/bin/answer.py?hl=en&answer=187443) or by downloading the 
[temporary-tab.zip](https://github.com/drzax/chrome-temporary-tabs/blob/release/temporary-tab.zip?raw=true) and 
installing it using the 
[load unpacked extension option](https://developer.chrome.com/extensions/getstarted.html#unpacked) in developer mode.

Usage
-----
All tabs will automatically self destruct after a specified period of inactivity (default is 60 minutes).

- Active tabs will never self destruct.
- Pinned tabs will never self destruct.
- Defused tabs will never self destruct.

The *Defuse* button can be found by clicking the toolbar icon.

### Toolbar icons

The toolbar icon can take any of these three states which indicates the status of the current tab.

- <img src="https://github.com/drzax/chrome-temporary-tabs/raw/master/images/disabled-19.png"> This tab cannot self 
  destruct (it probably hasn't finished loading yet).
- <img src="https://github.com/drzax/chrome-temporary-tabs/raw/master/images/apocalypse-19.png"> This tab is currently 
  set to self destruct after 60 minutes of inactivity.
- <img src="https://github.com/drzax/chrome-temporary-tabs/raw/master/images/infinity-19.png"> This tab has been defused 
  or is pinned and therefore will not self destruct.

Clicking the toolbar icon will reveal a list of tabs which have recently suffered the fate of self destruction. The most 
recent 50 tabs which have suffered this fate are kept in the log.	

Contributions
-------------
Contributions to this extension, or the [Tab Registry](https://github.com/drzax/chrome-tab-registry) library it uses are 
most welcome via pull requests.

Credits
-------
Icons from the [Noun Project](http://thenounproject.com/): 
- [Infinity](http://thenounproject.com/noun/infinity/#icon-No9992) designed by 
  [Cengiz SARI](http://thenounproject.com/cengizsari) from The Noun Project
- [Apocalypse](http://thenounproject.com/noun/apocalypse/#icon-No9383) designed by 
  [Mark Szulyovszky](http://thenounproject.com/markszulyovszky) from The Noun Project

License
-------
[The MIT License (MIT)](http://drzax.mit-license.org/)
Copyright © 2013 [Simon Elvery](http://elvery.net) <simon@elvery.net>
