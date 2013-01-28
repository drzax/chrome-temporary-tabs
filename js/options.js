;(function($, undefined){
	
	var timeout;
	
	function save(e) {
		var input = e.target,
			$status = $("#status");

		chrome.storage.sync.get({timeout: 60, unit: 'minute'}, function(data){
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
		chrome.storage.sync.get({timeout: 60, unit: 'minute'}, function(data){
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
	
	function toggleRegistry() {
		var btn = $('#registry-toggle').text();
		
		if (btn == 'View registry') {
			$('#registry').slideDown();
			$('#registry-toggle').text('Hide registry');
			timeout = setInterval(renderRegistry, 100);
		} else {
			$('#registry').slideUp();
			$('#registry-toggle').text('View registry');
			clearInterval(timeout);
		}
	}
	
	function countdown(lit,fuse) {
		var diff, hours, minutes, seconds, now = new Date();
		
		if (lit === undefined || fuse === undefined) return 'Never';
		
		diff = lit-now+fuse;
		
		if (diff <= 0) return '';
		
		diff = Math.floor(diff / 1000); // everything to seconds
		
		hours = Math.floor(diff/60/60);
		
		diff -= hours*60*60;
		
		minutes = Math.floor(diff/60);
		seconds = diff - minutes*60;
		
		return hours + ':' +  ('0'+minutes).slice(-2) + ':' + ('0'+seconds).slice(-2);
	}
	
	function renderRegistry() {
		var registry = chrome.extension.getBackgroundPage().TabRegistry.registry(),
			r, k, rows, diff, unit, now = new Date();
		rows = '';
		for (r in registry) {
			
			if (r === 'previous') continue;
			
			for (k in registry[r]) {
				rows += '<tr class="' + r +'">';
				rows += '<td>' + k + '</td>';
				rows += '<td>' + registry[r][k].tabId + '</td>';
				rows += '<td>' + registry[r][k].tabIndex + '</td>';
				rows += '<td>' + registry[r][k].fingerprint + '</td>';
				rows += '<td><pre>' + JSON.stringify(registry[r][k].attrs, null, 2) + '</pre></td>';
				rows += '<td>' + ((r === 'current') ? countdown(registry[r][k].attrs['fuse-lit'],registry[r][k].attrs['fuse-length']) : 'NA' ) + '</td>';
				rows += '</tr>';
			}
		}
		$('#registry-current tbody').html(rows);
		
		rows = '';
		r = 'previous';
		for (k in registry[r]) {
			rows += '<tr>';
			rows += '<td>' + k + '</td>';
			rows += '<td>' + registry[r][k].tabId + '</td>';
			rows += '<td>' + registry[r][k].tabIndex + '</td>';
			rows += '<td>' + registry[r][k].fingerprint + '</td>';
			rows += '<td><pre>' + JSON.stringify(registry[r][k].attrs, null, 2) + '</pre></td>';
			rows += '</tr>';
		}
		
		$('#registry-previous tbody').html(((rows === '') ? '<tr><td colspan="5">All tabs from the previous session have been restored.</td></tr>' : rows));
	}
	
	$(function(){
		load();

		$(document).on('change', 'select', save);
		$(document).on('keyup', 'input', save);
		
		$('#registry-toggle').on('click', toggleRegistry);
		$('#clear').on('click', clear);
	});
})(jQuery)
