(function(undefined){
	
	var active = false,
		removed = [];
		
	chrome.storage.local.get({removed: []}, function(data){
		removed = data.removed;
	});
	
	chrome.extension.onMessage.addListener(function(message, sender) {
		if (sender.tab.active) {
			active = TabRegistry.guid(sender.tab.id);
		} else {
			arm(TabRegistry.guid(sender.tab.id));
		}
		updateBrowserButton();
	});
	
	chrome.tabs.onActivated.addListener(function(info) {
		
		var guid;
		
		// Make sure the browser button looks like it should.
		updateBrowserButton();
		
		guid = TabRegistry.guid(info.tabId);
		
		// Arm the tab we just switched away from.
		if (active) arm(active);
		
		// Disarm this tab
		disarm(guid);
		
		// Change which tab is active.
		active = guid || false;
		
	});
	
	chrome.tabs.onUpdated.addListener(updateBrowserButton);
	
	function arm(guid) {
		
		// If guid is null we can't arm anything
		if (guid == null) return;
		
		// Always disarm before arming to avoid double arming
		disarm(guid);
		
		chrome.storage.local.get(window.defaults, function(data){
			var multiplier = 1000;
			if (data.options.unit === 'minute') multiplier *= 60;
			if (data.options.unit === 'hour') multiplier *= 3600;
			if (data.options.unit === 'day') multiplier *= 86400;
			
			TabRegistry.set(guid, 'timeout', setTimeout(function(){
				chrome.tabs.get(TabRegistry.id(guid), function(tab){
					if (tab.active || tab.pinned || TabRegistry.get(guid, 'defused')) return;
					if (tab.url !== 'chrome://newtab/') {
						tab.removed = Date();
						tab.guid = guid;
						removed.unshift(tab);
						while (removed.length > 30) removed.pop();
						chrome.storage.local.set({removed: removed});
					}
					chrome.tabs.remove(tab.id);
				});
			}, data.options.timeout*multiplier));
		});
	}
	
	function disarm(guid) {
		if (guid !== null) {
			clearTimeout(TabRegistry.get(guid, 'timeout'));
		}
	}
	
	function updateBrowserButton() {
		
		function setIcon(icon) {
			chrome.browserAction.setIcon({
				path: {
					"19": "images/"+icon+"-19.png",
					"38": "images/"+icon+"-38.png"
				}
			});
		}
		
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs){
			
			var tab, guid = (tabs.length) ? TabRegistry.guid(tabs[0].id) : null;
			// If this tab is rogue
			if (guid === null) {
				setIcon('disabled');
				return;
			}
			
			tab = tabs[0];
			
			if (tab.pinned || TabRegistry.get(guid, 'defused')) {
				setIcon('infinity');
			} else {
				setIcon('apocalypse');
			}
		});
	}
	
	window.defuse = function() {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs){
			var guid = (tabs.length) ? TabRegistry.guid(tabs[0].id) : null;
			
			if (guid) {
				TabRegistry.set(guid, 'defused', true);
			}
			
			updateBrowserButton();		
		});
	}
	
	window.defaults = {
		options: {
			timeout: 60,
			unit: 'minute'
		}
	}
	
})();