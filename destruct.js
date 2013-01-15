
/**
 * This funciton will self destruct.
 */
(function(undefined) {
	
	// Enclosure variables.
	var defused = false,	// Has this tab been defused?
		timeout = null,		// Timeout ID
		fn = {};			// Private fuctions
	
	// Receive orders from mission control
	fn.order = function (request, sender, sendResponse) {
		fn[request.command](request.params);
	}
	
	// Self destruct.
	fn.boom = function(){
		// Never explode a defused tab.
		if (defused) return;
		
		// Let mission control push the plunger.
		chrome.extension.sendMessage('boom');
	};
	
	// Arm this tab.
	fn.arm = function(params){
		clearTimeout(timeout);
		timeout = setTimeout(fn.boom, parseInt(params.fuseLength));
	};
	
	fn.disarm = function(params) {
		clearTimeout(timeout);
	};
	
	// Listen for commands from mission control
	chrome.extension.onMessage.addListener(fn.order);
	
	// Let mission control know that everything is in place.
	chrome.extension.sendMessage('activated');
	
})();