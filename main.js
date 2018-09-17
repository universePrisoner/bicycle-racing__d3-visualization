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
		let legends = {
			'legend-1' : 'No doping allegations',
			'legend-2' : 'Riders with doping allegations'
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

		let svg			= d3.select('body').append('svg').attr('class', 'canvas').attr('width', DIMENSIONS.canvas.width).attr('height', DIMENSIONS.canvas.height);
		let chart		= svg.append('g').attr('class', 'chart').attr('transform', 'translate(' + DIMENSIONS.margins.left + ', ' + DIMENSIONS.margins.top + ')');
		let tooltip 	= d3.select('body').append('div').attr('class', 'tooltip').attr('id', 'tooltip');
		let title 		= d3.select('body').append('h1').attr('id', 'title').attr('class', 'title').text('Doping in Professional Bicycle Racing');
		let subTitle 	= d3.select('body').append('h2').attr('class', 'subtitle').text('35 Fastest times up Alpe d\'Huez');

		// Append the axes at the svg
		svg.append('g')
			.call(xAxis)
			.attr('id', 'x-axis')
			.attr('transform', 'translate(' + DIMENSIONS.margins.left + ', ' + ( DIMENSIONS.canvas.height * 2 ) + ')' )
			.style('opacity', 0)
			.transition()
			.duration(1000)
			.style('opacity', 1)
			.attr('transform', 'translate(' + DIMENSIONS.margins.left + ', ' + ( DIMENSIONS.canvas.height - DIMENSIONS.margins.bottom ) + ')' );
		svg.append('g')
			.call(yAxis)
			.attr('id', 'y-axis')
			.attr('transform', 'translate(-' + DIMENSIONS.margins.left * 5 + ', ' + DIMENSIONS.margins.top + ')')
			.style('opacity', 0)
			.transition()
			.duration(1000)
			.style('opacity', 1)
			.attr('transform', 'translate(' + DIMENSIONS.margins.left + ', ' + DIMENSIONS.margins.top + ')');

		chart.selectAll('circle')
			.data(json)
			.enter()
			.append('a') // Make circle as link to more information about a biker
			.attr('href', (d) => d.URL)
			.attr('target', '_blank')
			.append('circle')
			.attr('class', 'dot')
			.attr('data-xvalue', (d) => d.Year)
			.attr('data-yvalue', (d) => d.Time)
			.attr('r', 0)
			.attr('cx', (d) => xScale(d.Year))
			.attr('cy', (d) => yScale(d.Time))
			.attr('stroke', '#000000')
			.attr('fill', (d) => circleBackground(d.Doping == '')) // Fill circle depending on the doping test.
			.on('mouseover', (d) => {
				tooltip	.attr('data-year', d.Year)
						.style('left', (d3.event.pageX) + 5 + 'px')
						.style('top', (d3.event.pageY) + 5 + 'px')
						.style('opacity', 0.9)
						.style('background', () => circleBackground(d.Doping == '')) // Change background depending on the doping test.
						.html( `
							<span class="tooltip__row-title tooltip__name">Name:</span> ${ d.Name }<br/>
							<span class="tooltip__row-title tooltip__year">Year:</span> ${ d.Year } <br/>
							<span class="tooltip__row-title tooltip__time">Record:</span> ${ d.Time.getMinutes() }:${ d.Time.getSeconds() } <br/>
							<span class="tooltip__tips">Click on the circle to read more...</span>
						` );
			} )
			.on('mousemove', (d) => {
				tooltip.style('left', (d3.event.pageX) + 5 + 'px').style('top', (d3.event.pageY) + 5 + 'px');
			})
			.on('mouseout', (d) => {
				tooltip.style('left', -1000).style('top', -1000).style('opacity', 0);
			})
			.transition()
			.delay((d, i) => i * 50 )
			.attr('r', 6);

		let legend1 = svg.append('g').attr('id','legend').attr('transform', 'translate(850, 100)');
		legend1.append('text').text(legends['legend-1']).attr('transform', 'translate(30, 15)');
		legend1.append('rect').attr('x', 0).attr('y', 0).attr('width', 20).attr('height', 20).style('fill', circleBackground(false));
		legend1.style('opacity', 0).transition().duration(1).style('opacity', 1);

		let legend2 = svg.append('g').attr('id','legend').attr('transform', 'translate(850, 125)');
		legend2.append('text').text(legends['legend-2']).attr('transform', 'translate(30, 15)');
		legend2.append('rect').attr('x', 0).attr('y', 0).attr('width', 20).attr('height', 20).style('fill', circleBackground(true));
		legend2.style('opacity', 0).transition().duration(1).style('opacity', 1);

		let yAxisLabel = svg.append('text').text('Time in Minutes').attr('transform', 'rotate(-90), translate(-200, 50)');

		return false;
	}
};

xhr.send();

