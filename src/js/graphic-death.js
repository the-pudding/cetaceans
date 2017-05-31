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

const scaleXage = d3.scaleLinear()
const scaleXbreeding = d3.scaleLinear()
let breedingSliderValue = null
let ageSliderValue = null

const animalsAdded = 26


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

	scaleXage
		.range([0, graphicW])
		//.padding(0.1)
		//.domain(stackedData[0].map(d => d.data.year))
		.domain([15, 62])
		.clamp(true)

	scaleXbreeding
		.range([0, graphicW])
		//.padding(0.1)
		//.domain(stackedData[0].map(d => d.data.year))
		.domain([2017, 2050])
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

	// "If Breeding Ended in..." Slider
	const breedingSlider = gEnter.append('g')
		.attr('class', 'slider slider--Breeding')
		.attr('transform', `translate(0, ${margin})`)

}

function updateDOM(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('g')

	g.attr('transform', translate(margin, margin))

	// "All Animals Live to...." Slider

	const ageSlider = svg.select('.slider--Age')

	ageSlider.append('line')
		.attr('class', 'track')
		.attr('x1', scaleXage.range()[0])
		.attr('x2', scaleXage.range()[1])
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	  	.attr('class', 'track-overlay')
	  	.call(d3.drag()
	  		.on("start.interrupt", function() { ageSlider.interrupt(); })
	  		.on("start drag", function() { updateAgeSlider(Math.floor(scaleXage.invert(d3.event.x)))})
	  		.on('end', d => {ageSliderValue = Math.floor(scaleXage.invert(d3.event.x))}))

	ageSlider.insert('g', '.track-overlay')
		.attr('class', 'ticks')
		.attr('transform', 'translate(0' + 18 + ')')
		.selectAll('text')
			.data(scaleXage.ticks(10))
			.enter().append('text')
				.attr('x', scaleXage)
				.attr('text-anchor', 'middle')
				.text(d => d)

	const ageHandle = ageSlider.insert('circle', '.track-overlay')
		.attr('class', 'ageHandle')
		.attr('r', 9)



	// "If Breeding Ended in..." Slider

	const breedingSlider = svg.select('.slider--Breeding')

	breedingSlider.append('line')
		.attr('class', 'track')
		.attr('x1', scaleXbreeding.range()[0])
		.attr('x2', scaleXbreeding.range()[1])
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	  	.attr('class', 'track-overlay')
	  	.call(d3.drag()
	  		.on("start.interrupt", function() { breedingSlider.interrupt(); })
	  		.on("start drag", function() { updateBreedingSlider(Math.floor(scaleXbreeding.invert(d3.event.x)))})
	  		.on('end', function() {breedingSliderValue = Math.floor(scaleXbreeding.invert(d3.event.x))
	  			calculateData(ageSliderValue, breedingSliderValue)}))

	breedingSlider.insert('g', '.track-overlay')
		.attr('class', 'ticks')
		.attr('transform', 'translate(0' + 18 + ')')
		.selectAll('text')
			.data(scaleXbreeding.ticks(10))
			.enter().append('text')
				.attr('x', scaleXbreeding)
				.attr('text-anchor', 'middle')
				.text(d => d)

	const breedingHandle = breedingSlider.insert('circle', '.track-overlay')
		.attr('class', 'breedingHandle')
		.attr('r', 9)

}

function updateAgeSlider(sliderValue){
	const ageHandle = d3.select('.ageHandle')
		.attr('cx', scaleXage(sliderValue))

	//ageSliderValue = sliderValue

/*	sliderData = data
	sliderData.forEach(function(d){
		d.deathYear = (sliderValue - d.currentAge) + 2017
		console.log(sliderValue)
	})*/
}

function updateBreedingSlider(sliderValue){
	const breedingHandle = d3.select('.breedingHandle')
		.attr('cx', scaleXbreeding(sliderValue))

	//breedingSliderValue = sliderValue

/*	let maxYear = Math.max.apply(Math, data.map( d => d.deathYear))*/

}

function calculateData(ageSliderValue, breedingSliderValue){
	sliderData = tkData

	for (let i = 0; i < breedingSliderValue-2017; i++){

		sliderData.push({birthYear: breedingSliderValue - i, 
			count : animalsAdded})

	}

	sliderData.sort((a,b) => d3.ascending(a.birthYear, b.birthYear))

	console.log(breedingSliderValue)

	console.log(sliderData)

	/*let maxYear = Math.max.apply(Math, data.map( d => d.deathYear))
*/


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