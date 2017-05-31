import * as d3 from 'd3'
import loadData from './load-data-death'

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--death')
const graphicSel = containerSel.select('.death__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')

let tkData = []
let sliderData = []
let margin = 100
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false

const scaleX = d3.scaleLinear()

function translate(x, y) {	

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 20000px)').matches
}

function resizeGraphic() {
	const ratio = 1.5
	graphicW = width
	graphicH = graphicW / ratio

	graphicSel
		.style('height', `${graphicH}px`)

}

function updateScales(data) {

	scaleX
		.range([0, graphicW])
		//.padding(0.1)
		//.domain(stackedData[0].map(d => d.data.year))
		.domain([15, 62])
		.clamp(true)
}

function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

		console.log(graphicSel)

	const gEnter = svg
		.append('g')
		.attr('class', 'deathPlot')

	// "All Animals Live to...." Slider
	const ageSlider = gEnter.append('g')
		.attr('class', 'slider slider--Age')

}

function updateDOM(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('g')

	g.attr('transform', translate(margin, margin))

	const ageSlider = svg.select('.slider--Age')

	ageSlider.append('line')
		.attr('class', 'track')
		.attr('x1', scaleX.range()[0])
		.attr('x2', scaleX.range()[1])
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	  	.attr('class', 'track-overlay')
	  	.call(d3.drag()
	  		.on("start.interrupt", function() { ageSlider.interrupt(); })
	  		.on("start drag", function() { updateData(data, scaleX.invert(d3.event.x))
	  			console.log(sliderData)}))

	ageSlider.insert('g', '.track-overlay')
		.attr('class', 'ticks')
		.attr('transform', 'translate(0' + 18 + ')')
		.selectAll('text')
			.data(scaleX.ticks(10))
			.enter().append('text')
				.attr('x', scaleX)
				.attr('text-anchor', 'middle')
				.text(d => d)

	const handle = ageSlider.insert('circle', '.track-overlay')
		.attr('class', 'handle')
		.attr('r', 9)

}

function updateData(data, sliderValue){
	const handle = d3.select('.handle')
		.attr('cx', scaleX(sliderValue))

	sliderData = data
	sliderData.forEach(function(d){
		d.deathYear = Math.floor(sliderValue - d.currentAge) + 2017
		console.log(sliderValue)
	})
}


function setup() {
	setupDOM()
	resize()

}

function resize() {
	updateDimensions()
	resizeGraphic()
	updateScales()
	updateDOM(tkData)
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