(function($, undefined){
	
	function renderRegistry() {
		var registry = chrome.extension.getBackgroundPage().TabRegistry.registry(),
			r, k, rows;
		console.log(registry);
		for (r in registry) {
			rows = '';
			for (k in registry[r]) {
				rows += '<tr>';
				rows += '<td>' + k + '</td>';
				rows += '<td>' + registry[r][k].tabId + '</td>';
				rows += '<td>' + registry[r][k].tabIndex + '</td>';
				rows += '<td>' + registry[r][k].fingerprint + '</td>';
				rows += '<td>' + JSON.stringify(registry[r][k].attrs) + '</td>';
				rows += '</tr>';
			}
			$('#'+r).html(rows);
		}
	}
	
	$(function(){
		setInterval(renderRegistry, 100);
	});
})(jQuery);