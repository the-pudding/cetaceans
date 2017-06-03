import * as d3 from 'd3'
import loadData from './load-data-explore'

let tkData = []
let margin = 100
let width = 0
let height = 0
let gridSize = 0
let graphicW = 0
let graphicH = 0


let widthSquares = 50
let heightSquares = 50
let col =  null
let row =  null
let squareSize = 10
let gapSize = 1

const scaleX = d3.scaleBand()
const scaleY = d3.scaleBand()

let statusButton = null
let acqButton = null
let locationButton = null

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--explore')
const graphicSel = containerSel.select('.explore__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')

let color = d3.scaleOrdinal(d3.schemeCategory20);

function translate(x, y) {	

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
	//desktop = window.matchMedia('(min-width: 20000px)').matches
}

function sort(){

}


function resizeGraphic() {
	const ratio = 1
	graphicW = width
	graphicH = height

	squareSize = Math.floor(graphicW / 100)

	console.log(squareSize)


	graphicSel
		.style('height', `${height}px`)

}

function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

	const gEnter = svg
		.append('g')
		.attr('class', 'explorePlot')

	// Buttons
	statusButton = d3.select('#toggleStatus')
      
      statusButton.append('button')
      .text('Status')
      .attr('class', 'toggle status')

    acqButton = d3.select('#toggleAcq')
      
      acqButton.append('button')
      .text('Acquisition')
      .attr('class', 'toggle acq')

    locationButton = d3.select('#toggleLocation')
      
      locationButton.append('button')
      .text('Location')
      .attr('class', 'toggle location')



}

function setupEvents(data){
	statusButton.on('click', () => {

		const statusSort = data.sort(function(a, b) {
            return d3.ascending(a.Status, b.Status);
    	});

		const squares = d3.selectAll('.square')
			.data(statusSort)
			.attr('class', d => `square square--${d.Status}`)

		squares
			.transition()
				.duration(1000)
				.ease(d3.easeCubicInOut)
			    .attr('x', (d,i) => {col = Math.floor( i / widthSquares );
	            	return (col * squareSize) + (col * gapSize)})
	      		.attr('y', (d,i) => {row = i % heightSquares;
	      			return (heightSquares * squareSize) - ((row * squareSize) + (row * gapSize))})
		
	})

	acqButton.on('click', () => {

		const acqSort = data.sort(function(a, b) {
            return d3.ascending(a.Acquisition, b.Acquisition);
    	});

		const squares = d3.selectAll('.square')
			.data(acqSort, d => d.ID)
			.attr('class', d => `square square--${d.Acquisition}`)

		squares
			.transition()
				.duration(1000)
				.ease(d3.easeCubicInOut)
			    .attr('x', (d,i) => {col = Math.floor( i / widthSquares );
	            	return (col * squareSize) + (col * gapSize)})
	      		.attr('y', (d,i) => {row = i % heightSquares;
	      			return (heightSquares * squareSize) - ((row * squareSize) + (row * gapSize))})
		
		})


		locationButton.on('click', () => {

		const locationSort = data.sort(function(a, b) {
            return d3.ascending(a.Status, b.Status);
    	})
    		.sort(function(a, b) {
            return d3.descending(a.livingLocations, b.livingLocations);
    	})

		const squares = d3.selectAll('.square')
			.data(locationSort)
			//.attr('class', d => if(d.Status == "Alive") {return `square square--${d.livingLocations}`} else { return `square square--${d.Status}`})
			.attr('class', function(d){
				if(d.Status == "Alive") { return `square square--${d.livingLocations}`}
					else {return `square square--${d.Status}`}
			})



		squares
			.transition()
				.duration(1000)
				.ease(d3.easeCubicInOut)
				//.attr('fill', d => color(d.livingLocations))
			    .attr('x', (d,i) => {col = Math.floor( i / widthSquares );
	            	return (col * squareSize) + (col * gapSize)})
	      		.attr('y', (d,i) => {row = i % heightSquares;
	      			return (heightSquares * squareSize) - ((row * squareSize) + (row * gapSize))})
	})

}


function updateDom(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('g')

	g.attr('transform', translate(margin, margin))

	const plot = g.select('.explorePlot')

	const square = g.selectAll('.square')
		.data(data)

	const squareEnter = square.enter().append('rect')
		.attr('class', 'square')
        /*.attr('x', (d,i) => {col = Math.floor( i / widthSquares );
            return (col * squareSize) + (col * gapSize)})
      	.attr('y', (d,i) => {row = i % heightSquares;
      		return (heightSquares * squareSize) - ((row * squareSize) + (row * gapSize))})*/
		.attr('width', squareSize)
		.attr('height', squareSize)

	square.exit().remove()

	const squareMerge = squareEnter.merge(square)

	squareMerge.transition()
		.duration(400)
        .attr('x', (d,i) => {col = Math.floor( i / widthSquares );
            return (col * squareSize) + (col * gapSize)})
      	.attr('y', (d,i) => {row = i % heightSquares;
      		return (heightSquares * squareSize) - ((row * squareSize) + (row * gapSize))})
		.attr('width', squareSize)
		.attr('height', squareSize)


}






function setup() {
	setupDOM()
	resize()
	setupEvents(tkData)
}

function resize() {
	updateDimensions()
	resizeGraphic()
	updateDom(tkData)
	setupEvents(tkData)
}


function init() {
	loadData()
		.then((result) => {
			tkData = result
			setup()
		})
		.catch(err => console.log(err))
}

export default { init, resize }
