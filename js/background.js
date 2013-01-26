(function(undefined){
	
	var active = false, // GUID for the most recently active tab.
		removed = [];
		
	chrome.storage.local.get({removed: []}, function(data){
		removed = data.removed;
	});
	
	chrome.tabs.onActivated.addListener(function(info) {
		
		var guid;
		
		// Make sure the browser button looks like it should.
		updateBrowserButton();
		
		try {
			guid = TabRegistry.guid(info.tabId);
		} catch(e) {
			guid = false;
		}
		
		// Arm the tab we just switched away from.
		if (active) arm(active);
		
		// Disarm this tab
		if (guid) disarm(guid);
		
		// Change which tab is active.
		active = guid;
		
	});
	
	chrome.tabs.onUpdated.addListener(updateBrowserButton);
	
	function lightFuse(guid) {
		return function(){
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
		}
	}
	
	function arm(guid) {
		
		// If guid is null we can't arm anything
		if (!guid) return;
		
		// Always disarm before arming to avoid double arming
		disarm(guid);
		
		chrome.storage.sync.get(window.defaults, function(data){
			
			var multiplier = 1000;
			
			if (data.options.unit === 'minute') multiplier *= 60;
			if (data.options.unit === 'hour') multiplier *= 3600;
			if (data.options.unit === 'day') multiplier *= 86400;
			
			try {
				TabRegistry.set(guid, 'timeout', setTimeout(lightFuse(), data.options.timeout*multiplier));
			} catch (e) {}
				
		});
	}
	
	function disarm(guid) {
		try {
			clearTimeout(TabRegistry.get(guid, 'timeout'));
			TabRegistry.set(guid, 'timeout', null);
		} catch(e) {}
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
			
			var tab, guid;
				
			tab = (tabs.length) ? tabs[0] : false; 
			try {
				guid = (tab) ? TabRegistry.guid(tab.id) : false;
			} catch (e) {
				guid = false;
			}
			
			
			// If this tab is rogue
			if (guid === false) {
				setIcon('disabled');
				return;
			}
			
			if (tab.pinned || TabRegistry.get(guid, 'defused')) {
				setIcon('infinity');
			} else {
				setIcon('apocalypse');
			}
		});
	}
	
	// Public function so browser action can reach it.
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
	
	// Public defaults so options page can reach it.
	window.defaults = {
		options: {
			timeout: 60,
			unit: 'minute'
		}
	}
	
})();