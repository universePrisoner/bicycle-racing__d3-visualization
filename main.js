'use strict';

let xhr = new XMLHttpRequest();
xhr.open('GET', 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
xhr.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		let json = JSON.parse(this.responseText);

		const DIMENSIONS = {
			'canvas' : {
				'width' : 1100,
				'height': 650
			},
			'chart' : {
				'width' : 1000 - 100,
				'height': 650 - 100
			},
			'margins' : {
				'left' : 100,
				'top'  : 50,
				'right': 50,
				'bottom': 50
			}
		}

		let circleBackground = d3.scaleOrdinal(d3.schemeCategory10);

		// Convert a time race to actual date for each element
		for (let d in json) {
			let parsedTime = json[d]['Time'].split(':');
			json[d].Time = new Date( Date.UTC(1970, 0, 1, 0, +parsedTime[0], +parsedTime[1] ) );
		}

		/* Calculate scales
		*  @xScale: range function takes min and max width of the chart, domain function takes min year of the races minus one and max year of the races plus one
		*  @yScale: range function takes min and max height of the chart, domain function takes min and max time of the each race
		*/
		let xScale  = d3.scaleLinear()
						.range([0, DIMENSIONS.chart.width])
						.domain([d3.min(json, (d) => d.Year - 1), d3.max(json, (d) => d.Year + 1)]);
		let yScale = d3.scaleTime()
						.range([0, DIMENSIONS.chart.height])
						.domain(d3.extent(json, (d) => d.Time));

		/* Construct axes and format tickets of the axes
		*/
		let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
		let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

		let svg		= d3.select('body').append('svg').attr('class', 'canvas').attr('width', DIMENSIONS.canvas.width).attr('height', DIMENSIONS.canvas.height);
		let chart	= svg.append('g').attr('class', 'chart').attr('transform', 'translate(' + DIMENSIONS.margins.left + ', ' + DIMENSIONS.margins.top + ')');
		let tooltip = d3.select('body').append('div').attr('class', 'tooltip');

		// Append the axes at the svg
		svg.append('g')
			.call(xAxis)
			.attr('id', 'x-axis')
			.attr('transform', 'translate(' + DIMENSIONS.margins.left + ', ' + ( DIMENSIONS.canvas.height - DIMENSIONS.margins.bottom ) + ')' );
		svg.append('g')
			.call(yAxis)
			.attr('id', 'y-axis')
			.attr('transform', 'translate(' + DIMENSIONS.margins.left + ', ' + DIMENSIONS.margins.top + ')');

		chart.selectAll('circle')
			.data(json)
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('data-xvalue', (d) => d.Year)
			.attr('data-yvalue', (d) => d.Time)
			.attr('r', 8)
			.attr('cx', (d) => xScale(d.Year))
			.attr('cy', (d) => yScale(d.Time))
			.attr('stroke', '#000000')
			.attr('fill', (d) => circleBackground(d.Doping == '')) // Fill circle depending on the doping test.
			.on('mouseover', (d) => {
				tooltip.style('left', (d3.event.pageX) + 5 + 'px').style('top', (d3.event.pageY) + 5 + 'px').style('opacity', 0.8);
				tooltip.text( '15:30' );
			} )
			.on('mousemove', (d) => {
				tooltip.style('left', (d3.event.pageX) + 5 + 'px').style('top', (d3.event.pageY) + 5 + 'px');
			})
			.on('mouseout', (d) => {
				tooltip.style('left', -1000).style('top', -1000).style('opacity', 0);
			});

		return false;
	}
};

xhr.send();

