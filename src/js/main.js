let req = new XMLHttpRequest()
req.open( "GET", 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true );

req.onload  =   function() {
	const json = JSON.parse(req.responseText);
	
	let scales = {
		'xScale'	: d3.linearScale().domain().range(),
		'yScale'	: d3.linearScale().domain().range
	}

	let text		=	{
		'title'		:	'Doping in Professional Bicycle Racing',
		'subtitle'	:	'35 Fastest times up Alpe d\'Hues',
		'groups'	:	{
							'noDoping'	: 'No doping allegations',
							'doping'	: 'Riders with doping allegations'
						},
		'axes'		:	{
						'yAxis'	: 'Time in Minutes'
						}
					}
	const COLORS	=	{
					'white'		: '#FFFFFF'
					}
}

req.send();