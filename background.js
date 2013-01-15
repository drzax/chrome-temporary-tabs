(function(undefined){
	// Closure variables
	var defusedTabs = [],			// Keep track of defused tabs
		lastActiveTab = false,		// Keep track of last active tab
		fn = {};					// Private functions
	
	// Arm a tab
	fn.arm = function(tabId) {
		
		// Never arm a defused tab
		if (fn.isDefused(tabId)) return;
		
//		console.log('armed', tabId);
		
		chrome.storage.local.get('options', function(data){
//			chrome.tabs.sendMessage(tabId, {command: 'arm', params: {fuseLength: data.options.timeout*1000}});
		});
	};
	
	// Disarm a tab
	fn.disarm = function(tabId) {
//		console.log('disarmed', tabId);
		chrome.tabs.sendMessage(tabId, {command: 'disarm', params: {}});
	};
	
	// Defuse a tab
	fn.defuse = function(tab) {
		if (!fn.isDefused(tab.id)) {
//			console.log('defused', tab.title);
			defusedTabs.push(tab.id);
			fn.setDefusedIcon(tab.id);
//			chrome.storage.local.set({defused:})
		}
	};
	
	// Set the defused icon
	fn.setDefusedIcon = function(tabId){
		chrome.pageAction.setIcon({
			tabId: tabId,
			path: {
				"38": "images/infinity.png",
				"19": "images/infinity_19.png"
			}
		});
		
		chrome.pageAction.setTitle({
			tabId: tabId,
			title: "Self destruct successfully defused"
		})
	}
	
	// Destroy a tab
	fn.boom = function(data) {
		
		// Don't remove tabs which are pinned or currently focused
		if ( !data.tab.pinned && !fn.isDefused(data.tab.id) ) {
//			console.log('log',data.tab);
//			chrome.tabs.remove(data.tab.id);
		}
	};
	
	// Is this tab defused?
	fn.isDefused = function(tabId) {
		return (defusedTabs.indexOf(tabId) >= 0);
	}
	
	// Tab registers as activated.
	fn.activated = function(data) {
		if (fn.isDefused(data.tab.id)) {
			fn.setDefusedIcon(data.tab.id);
		}
		chrome.pageAction.show(data.tab.id);
	}
	
	// Receive messages from field agents.
	chrome.extension.onMessage.addListener(function(request, sender, response){
		fn[request](sender);
	});
	
	chrome.tabs.onActivated.addListener(function(info){
		if (lastActiveTab) fn.arm(lastActiveTab);
		lastActiveTab = info.tabId;
		fn.disarm(info.tabId);
	});

	chrome.tabs.onCreated.addListener(function(tab){
		console.log(tab.url);
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId, info){
		var idx = defusedTabs.indexOf(tabId);
		if (idx >= 0) defusedTabs.splice(idx,1);
		if (lastActiveTab == tabId) lastActiveTab = false;
	});

	chrome.pageAction.onClicked.addListener(function(tab){
		fn.defuse(tab);
	});
	
	chrome.runtime.onStartup.addListener(function(){
		chrome.storage.local.get({defused:[]}, function(data){
//			console.log('startup', data);
		});
	});
	
	chrome.tabs.onUpdated.addListener(function(tabId, info, tab){
		if (fn.isDefused(tabId)) {
			chrome.storage.local.get({defused:[]}, function(data){
				data.defused[tabId] = tab.url;
				chrome.storage.local.set(data);
			});
		}
	});
	
})();

