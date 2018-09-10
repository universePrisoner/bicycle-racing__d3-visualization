let req = new XMLHttpRequest()
req.open( "GET", 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true );

req.onload  =   function() {
	const json = JSON.parse(req.responseText);
	
}

req.send();