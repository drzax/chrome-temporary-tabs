var loopTimeout = 0;
var tabs = [];

(function loop(){
	loopTimeout = setTimeout(function(){

		chrome.idle.queryState(15,function(state){
			
			// Clean up temporary tabs
			if (state === 'idle') {
				chrome.tabs.remove(tabs);
			}
		});

		// Loop
		loop();
	},1000);
})();

function defuse(tab) {
	var idx = tabs.indexOf(tab.id);
	if (idx >= 0) {
		tabs.splice(idx,1);
	}
	console.log(tabs);
	
//	chrome.storage.local.get({'temporaryTab':[]}, function(data){
//		data.temporaryTab.push(tab.id);
//		chrome.storage.local.set({'temporaryTab':data.temporaryTab});
//		if (loopTimeout === 0) loop();
//	});
}

chrome.tabs.onUpdated.addListener(function(tabId, info, tab){
	chrome.pageAction.show(tabId);
});

chrome.tabs.onRemoved.addListener(function(tabId, info){
	var idx = tabs.indexOf(tabId);
	if (idx >= 0) {
		tabs.splice(idx,1);
	}
	
//	chrome.storage.local.get({'temporaryTab':[]}, function(data){
//		var idx = data.temporaryTab.indexOf(tabId);
//		if (idx >= 0) {
//			data.temporaryTab.splice(idx,1);
//			chrome.storage.local.set({'temporaryTab':data.temporaryTab});
//			
//			if (data.temporaryTab.length === 0) {
//				clearTimeout(loopTimeout);
//				loopTimeout = 0;
//			}
//		}
//	});
});

