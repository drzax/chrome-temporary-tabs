;(function($, undefined){
	function save(e) {
		var input = e.target,
			$status = $("#status");

		chrome.storage.sync.get(chrome.extension.getBackgroundPage().defaults, function(data){
			data.options[input.name] = input.value;
			chrome.storage.sync.set(data);
		});
		

		// Update status to let user know options were saved.
		$status.show(function(){
			$(this).fadeOut(1000);
		});
		
		modifyInstructions();
	}
	
	function modifyInstructions() {
		$('span.timeout').text($('#timeout').val());
		$('span.unit').text($('#unit').val() + (($('#timeout').val()>1)?'s':''));
	}

	/**
	 * Load options back into the form from storage.
	 */
	function load() {
		chrome.storage.sync.get(chrome.extension.getBackgroundPage().defaults, function(data){
			var key;
			for (key in data.options) {
				document.getElementById(key).value = data.options[key];
			}
			modifyInstructions();
		});
	}

	function clear() {
		chrome.extension.getBackgroundPage().TabRegistry.reset();
		chrome.storage.sync.clear();
		chrome.storage.local.clear();
		load();
	}
	
	function openRegistry() {
		chrome.windows.create({url: 'registry.html', type: 'popup', width: 900, height: 1200}, function(window) {});
	}
	
	$(function(){
		load();

		$(document).on('change', 'select', save);
		$(document).on('keyup', 'input', save);
		
		$('#registry').on('click', openRegistry);
		$('#clear').on('click', clear);
	});
})(jQuery)
