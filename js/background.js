(function(undefined){
	
	var active = {}, // Keep track of active tabs in each window.
		removed = [];
		
	chrome.storage.local.get({removed: []}, function(data){
		removed = data.removed;
	});
	
	chrome.tabs.onActivated.addListener(function(info) {
		
		// Make sure the browser button looks like it should.
		updateBrowserButton();
		
		// Arm the tab we just switched away from.
		if (active[info.windowId]) arm(active[info.windowId]);
		
		// Disarm this tab
		disarm(info.tabId);
		
		// Change which tab is active.
		active[info.windowId] = info.tabId;
		
	});
	
	TabRegistry.onAdded.addListener(function(guid, tabId){
		chrome.tabs.get(tabId, function(tab){
			disarm(tab.id);
			if (tab.active) {
				active[tab.windowId] = tab.id;
			} else {
				try {

					guid = TabRegistry.guid(tab.id);
					if (TabRegistry.attr.get(guid, 'timeout') === undefined) {
						arm(tab.id);
					}

				} catch (e) {
					console.error(e);
				}
			}
			updateBrowserButton();
		});
		
	});
	
	chrome.tabs.onUpdated.addListener(updateBrowserButton);
	
	function lightFuse(guid) {
		return function(){
			chrome.tabs.get(TabRegistry.id(guid), function(tab){
				
				// Clean the registry
				TabRegistry.attr.clear(guid, 'timeout');
				TabRegistry.attr.clear(guid, 'fuse-length');
				TabRegistry.attr.clear(guid, 'fuse-lit');
				
				// Don't close tabs that shouldn't be closed
				if (tab.active || tab.pinned || TabRegistry.attr.get(guid, 'defused')) return;

				tab.removed = Date();
				tab.guid = guid;
				removed.unshift(tab);

				// Trim removed list
				while (removed.length > 50) removed.pop();

				chrome.storage.local.set({removed: removed});
				
				chrome.tabs.remove(tab.id);
			});
		}
	}
	
	function arm(tabId) {
		
		var guid;
		
		// Always disarm before arming to avoid double arming
		disarm(tabId);
		
		chrome.storage.sync.get(window.defaults, function(data){
			
			var multiplier = 1000;
			
			if (data.options.unit === 'minute') multiplier *= 60;
			if (data.options.unit === 'hour') multiplier *= 3600;
			if (data.options.unit === 'day') multiplier *= 86400;
			try {
				guid = TabRegistry.guid(tabId);
				chrome.tabs.get(tabId, function(tab){
					if ( !(tab.active || tab.pinned || TabRegistry.attr.get(guid, 'defused')) ) {

						TabRegistry.attr.set(guid, 'timeout', setTimeout(lightFuse(guid), data.options.timeout*multiplier));
						TabRegistry.attr.set(guid, 'fuse-lit', new Date());
						TabRegistry.attr.set(guid, 'fuse-length', data.options.timeout*multiplier);

					}
				});
			} catch (e) {
				console.error(e);
			}
				
		});
	}
	
	function disarm(tabId) {
		
		var guid;
		
		try {
			guid = TabRegistry.guid(tabId);
			clearTimeout(TabRegistry.attr.get(guid, 'timeout'));
			TabRegistry.attr.clear(guid, 'timeout');
			TabRegistry.attr.clear(guid, 'fuse-length');
			TabRegistry.attr.clear(guid, 'fuse-lit');
		} catch(e) {
			console.error(e);
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
			
			chrome.browserAction.setTitle({
				title: ((icon == 'apocalypse') ? 'This tab will self destruct.' : 'This tab will not self destruct.')
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
			
			if (tab.pinned || TabRegistry.attr.get(guid, 'defused')) {
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
				TabRegistry.attr.set(guid, 'defused', true);
			}
			
			updateBrowserButton();		
		});
	}
	
})();