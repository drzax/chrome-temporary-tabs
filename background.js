
(function(undefined){
	
	var active = false,
		removed = [];
		
	chrome.storage.local.get({removed: []}, function(data){
		removed = data.removed;
		console.log(removed);
	});
	
	chrome.extension.onMessage.addListener(function(message, sender) {
		if (sender.tab.active) {
			active = TabRegistry.guid(sender.tab.id);
		} else {
			arm(TabRegistry.guid(sender.tab.id));
		}
	});
	
	function arm(guid) {
		
		// If guid is null we can't arm anything
		if (guid == null) return;
		
		console.log('arming', guid);
		
		// Always disarm before arming to avoid double arming
		disarm(guid);
		
		chrome.storage.local.get('options', function(data){
			TabRegistry.set(guid, 'timeout', setTimeout(function(){
				chrome.tabs.get(TabRegistry.id(guid), function(tab){
					if (tab.active || tab.pinned || TabRegistry.get(guid, 'defused')) return;
					tab.removed = Date();
					tab.guid = guid;
					removed.unshift(tab);
					while (removed.length > 30) removed.pop();
					chrome.storage.local.set({removed: removed});
					chrome.tabs.remove(tab.id);
				});
			}, data.options.timeout*1000));
		});
	}
	
	function disarm(guid) {
		if (guid !== null) {
			console.log('disarming', guid);
			clearTimeout(TabRegistry.get(guid, 'timeout'));
		}
	}
	
	chrome.tabs.onActivated.addListener(function(info) {
		
		var guid = TabRegistry.guid(info.tabId);
		
		console.info('Tab activated.', info, guid, active);
		
		// Arm the tab we just switched away from.
		if (active) {
			
			arm(active);
		}
		
		disarm(guid);
		
		active = guid || false;
		
	});
	
	
})();