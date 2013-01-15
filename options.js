// Save this script as `options.js`

/**
 * Save options as they're edited.
 */
function save(e) {
	var input = e.target,
		data = {options:{}},
		status = document.getElementById("status");
	
	status.innerHTML = 'Saving...';
	data.options[input.name] = input.value;
	chrome.storage.local.set(data);

	// Update status to let user know options were saved.
	status.innerHTML = 'Saved';
	setTimeout(function() {
		status.innerHTML = "";
	}, 750);
}

/**
 * Load options back into the form from storage.
 */
function load() {
	var defaults = {
		'options': {
			'timeout': 60
		}
	};
	chrome.storage.local.get(defaults, function(data){
		var key;
		for (key in data.options) {
			document.getElementById(key).value = data.options[key];
		}
	});
}
document.addEventListener('DOMContentLoaded', load);
document.querySelector('input').addEventListener('change', save);