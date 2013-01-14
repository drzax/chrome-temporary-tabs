var loopTimeout = 0;

function loop(){
	loopTimeout = setTimeout(function(){

		chrome.idle.queryState(60,function(state){
			
			console.log('timeout');
			
			// Clean up temporary tabs
			if (state === 'idle') {
				chrome.storage.local.get({'temporaryTab':[]}, function(data){
					chrome.tabs.remove(data.temporaryTab);
				});
				chrome.storage.local.set({'temporaryTab':[]});
				clearTimeout(loopTimeout);
				loopTimeout = 0;
			}
		});

		// Loop
		loop();
	},1000);
};

function makeTemporary(tab) {
	chrome.storage.local.get({'temporaryTab':[]}, function(data){
		data.temporaryTab.push(tab.id);
		chrome.storage.local.set({'temporaryTab':data.temporaryTab});
		if (loopTimeout === 0) loop();
	});
}

chrome.commands.onCommand.addListener(function(command) {
	if (command === "temporaryTab") {
		chrome.tabs.create( {}, makeTemporary);
	}
	
	if (command === "selfDestruct") {
		chrome.tabs.getCurrent(makeTemporary);
	}
});

chrome.tabs.onRemoved.addListener(function(tabId, info){
	console.log(info);
	chrome.storage.local.get({'temporaryTab':[]}, function(data){
		var idx = data.temporaryTab.indexOf(tabId);
		if (idx >= 0) {
			data.temporaryTab.splice(idx,1);
			chrome.storage.local.set({'temporaryTab':data.temporaryTab});
			
			if (data.temporaryTab.length === 0) {
				clearTimeout(loopTimeout);
				loopTimeout = 0;
			}
		}
	});
});

