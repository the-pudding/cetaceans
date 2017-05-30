import * as d3 from 'd3'
import loadData from './load-data-explore'

let tkData = []
let margin = 100
let width = 0
let height = 0
let gridSize = 0
let graphicW = 0
let graphicH = 0
let desktop = false

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
	desktop = window.matchMedia('(min-width: 20000px)').matches
	gridSize = Math.floor(width / 53)

	console.log(graphicContainerSel.node())
}

function sort(){

}


function resizeGraphic() {
	const ratio = 1
	graphicW = width
	graphicH = height

	graphicSel
		.style('height', `${height}px`)

}

function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

		console.log(graphicSel)

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
}

function setupEvents(data){
	statusButton.on('click', () => {

		const statusSort = data.sort(function(a, b) {
            return d3.ascending(a.Status, b.Status);
    	});

		const squares = d3.selectAll('.square')
			.data(statusSort)

			console.log(squares)

		updateDom(statusSort)

		squares.transition()
			.duration(1000)
				.ease(d3.easeCubicInOut)
				.attr('fill', d => color(d.Status))
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

			console.log(squares)

		squares
			.transition()
				.duration(1000)
				.ease(d3.easeCubicInOut)
				.attr('fill', d => color(d.Acquisition))
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

	console.log(g)

	const plot = g.select('.explorePlot')

	const square = g.selectAll('.square')
		.data(data)

		console.log(square)

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
/*		.attr('width', squareSize)
		.attr('height', squareSize)*/

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
}


function init() {
	loadData()
		.then((result) => {
			tkData = result
			console.log(tkData)
			setup()
		})
		.catch(err => console.log(err))
}

export default { init, resize }
