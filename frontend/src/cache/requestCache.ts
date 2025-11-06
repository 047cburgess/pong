const cache = new Array<{method : string, url : string, data : any}>();


function addHistory<T>(method : string, url : string, data : T | null) {
	cache.push({ method, url, data });
	const el = document.createElement('div');
	el.className = 'border p-2 rounded';
	el.innerHTML = `<div class='flex justify-between'><span>${method} ${url}</span><button onclick="this.nextSibling.classList.toggle('hidden')">▼</button></div><pre class='hidden text-xs mt-2 bg-gray-50 p-2 rounded'>${JSON.stringify(data, null, 2)}</pre>`;
	document.getElementById('requestHistory')!.prepend(el);
}

