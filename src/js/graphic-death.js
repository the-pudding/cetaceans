import * as d3 from 'd3'
import loadData from './load-data-death'

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--death')
const graphicSel = containerSel.select('.death__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')

let tkData = []
let sliderData = []
let predictionData = []
/*let margin = 100*/
let margin = {top: 200, bottom: 25, left: 100, right: 50}
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false

const scaleXage = d3.scaleLinear()
const scaleXbreeding = d3.scaleLinear()
const scaleXchart = d3.scaleLinear()
const scaleYchart = d3.scaleLinear()

const populationLine = d3.line()


let breedingSliderValue = null
let ageSliderValue = null
let maxYear = null


const animalsAdded = 26


function translate(x, y) {	

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
/*	width = 800*/
	height = window.innerHeight
	//desktop = window.matchMedia('(min-width: 20000px)').matches
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
		.range([0, (graphicW - (margin.left + margin.right))/3])
		.domain([15, 62])
		.clamp(true)

	scaleXbreeding
		.range([0, (graphicW - (margin.left + margin.right))/3])
		.domain([2017, 2050])
		.clamp(true)

	scaleXchart
		.range([0, (graphicW - (margin.left + margin.right))])
		/*.domain([2017, d3.max(data, d => d.year)])*/
		.domain([2017, 2100])

		console.log(scaleXchart.domain())

	scaleYchart
		.range([(graphicH - margin.top - margin.bottom), 0])
		.domain([0, d3.max(data, d => d.population)])

		console.log(d3.max(data, d=>d.population))

	populationLine
		.x(d => scaleXchart(+d.year))
		.y(d => scaleYchart(+d.population))
		/*.domain([0, 600])*/

}


function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

	const gEnter = svg
		.append('g')
		.attr('class', 'deathPlot')

	// "All Animals Live to...." Slider
	const ageSlider = svg.append('g')
		.attr('class', 'slider slider--Age')
		.attr('transform', `translate(${margin.left}, ${margin.bottom *4})`)

	// "If Breeding Ended in..." Slider
	const breedingSlider = svg.append('g')
		.attr('class', 'slider slider--Breeding')
		.attr('transform', `translate(${margin.left *5}, ${margin.bottom *4})`)

	const axis = gEnter
		.append('g')
		.attr('class', 'g-axis')

	const x = axis
		.append('g')
		.attr('class', 'axis axis--x')

	const y = axis
		.append('g')
		.attr('class', 'axis axis--y')

}

function setupSliders (){

	const svg = graphicSel.select('svg')

	const g = svg.select('g')

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
	  		.on('end', d => {ageSliderValue = Math.floor(scaleXage.invert(d3.event.x))
	  			calculateData(ageSliderValue, breedingSliderValue)
	  			updateDOM(predictionData)}))

	ageSlider.insert('g', '.track-overlay')
			.attr('class', 'ticks')
			.attr('transform', 'translate(0,' + 20 + ')')
		.selectAll('text')
			.data(scaleXage.ticks(5))
			.enter().append('text')
				.attr('x', scaleXage)
				.attr('text-anchor', 'middle')
				.text(d => d)

	const ageHandle = ageSlider.insert('circle', '.track-overlay')
		.attr('class', 'handle ageHandle')
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
	  			calculateData(ageSliderValue, breedingSliderValue)
	  			updateDOM(predictionData)}))

	breedingSlider.insert('g', '.track-overlay')
		.attr('class', 'ticks')
		.attr('transform', 'translate(0,' + 20 + ')')
		.selectAll('text')
			.data(scaleXbreeding.ticks(3))
			.enter().append('text')
				.attr('x', scaleXbreeding)
				.attr('text-anchor', 'middle')
				.text(d => d)

	const breedingHandle = breedingSlider.insert('circle', '.track-overlay')
		.attr('class', 'handle breedingHandle')
		.attr('r', 9)


}

function updateDOM(data) {
	updateScales(data)
	updateAxis(data)

	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

		console.log(graphicW)

	const g = svg.select('g')

	g.attr('transform', translate(margin.right, margin.top))

	const plot = g.select('.explorePlot')

	const line = g.selectAll('.line')
		.data([data])


	const lineEnter = line.enter()
		.append('path')
		.attr('class', 'line')
		.attr('d', populationLine)

	// exit
	line.exit().remove()

	// update

	const lineMerge = lineEnter.merge(line)
	
	lineMerge.transition()
		.duration(400)
		.attr('d', populationLine)




}

function updateAxis(data) {
	const axis = graphicSel.select('.g-axis')

	const axisLeft = d3.axisLeft(scaleYchart)
	const axisBottom = d3.axisBottom(scaleXchart)

	console.log(axisBottom)

	const x = axis.select('.axis--x')
	const y = axis.select('.axis--y')

	const trim = graphicH - (margin.top + margin.bottom)

	x
		.attr('transform', `translate(0, ${trim})`)
		.transition()
		.duration(1500)
		.call(axisBottom
			.tickFormat(d3.format('d')))

	y
		.call(axisLeft)
}

function updateAgeSlider(sliderValue){

	const ageHandle = d3.select('.ageHandle')
		.attr('cx', scaleXage(sliderValue))
}

function updateBreedingSlider(sliderValue){
	const breedingHandle = d3.select('.breedingHandle')
		.attr('cx', scaleXbreeding(sliderValue))
}

function calculateData(ageSliderValue, breedingSliderValue){
	sliderData = tkData

	const newYears = d3.range(2017, breedingSliderValue).map(i => ({birthYear: i, count: animalsAdded}))

	sliderData = sliderData.concat(newYears)

	sliderData.forEach(d => d.deathYear = Math.max((ageSliderValue + d.birthYear), 2017))

	let nestSlider = d3.nest()
		.key(d => +d.deathYear)
		.rollup(leaves => d3.sum(leaves, d => d.count))
		.entries(sliderData)

/*	const missingYears = d3.range(2017, d3.min(nestSlider, d => d.key)).map(i => ({key: i, value: 0}))

	const totalNest = missingYears.concat(nestSlider)
*/
/*	console.log(missingYears)
	console.log(totalNest)*/

	maxYear = Math.max.apply(Math, sliderData.map( d => d.deathYear))

/*	const allYears = d3.range(2017, maxYear).map(i => ({key: i, value: }))*/

	const births = d3.range(breedingSliderValue, maxYear + 1).map(i => ({birthYear: i, count: 0})) 

	const birthsAll = newYears.concat(births)

	predictionData = d3.range(2017, maxYear + 1).map(i => ({year: i, population: 500}))

	console.log(predictionData)

	let population = 563
	for (let i = 0; i < predictionData.length; i++){
		predictionData[i].population = population
		population += birthsAll[i].count
		population -= nestSlider[i].value
	}



}


function setup() {
	setupDOM()
	resize()

}

function resize() {
	updateDimensions()
	resizeGraphic()
	updateScales(predictionData)
	setupSliders()
	updateDOM(predictionData)
/*	updateAxis()*/
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