import * as noUiSlider from 'nouislider'
import loadData from './load-data-death'


const bodySel = d3.select('body')
const containerSel = bodySel.select('.section--death')
const graphicSel = containerSel.select('.death__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')
const inputLifespanSel = graphicSel.select('.slider__lifespan input')
const inputBreedingbanSel = graphicSel.select('.slider__breedingban input')
const spanLifespanSel = graphicSel.select('.slider__lifespan span')
const spanBreedingbanSel = graphicSel.select('.slider__breedingban span')
const spanExistSel = graphicSel.select('.output span')

let tkData = []
let sliderData = []
let predictionData = []
let margin = { top: 20, bottom: 20, left: 45, right: 20 }
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false

const FONT_SIZE = 12

const scaleX = d3.scaleLinear()
const scaleY = d3.scaleLinear()

const populationLine = d3.line()


let breedingSliderValue = 2030
let ageSliderValue = 20
let maxYear = 2030


const animalsAdded = 26


function translate(x, y) {	

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 600px)').matches
}

function resizeGraphic() {
	const ratio = desktop ? 2 : 1.25
	graphicW = width
	graphicH = height * 0.6
}

function updateScales(data) {

	scaleX
		.range([0, (graphicW - (margin.left + margin.right))])
		.domain([2017, 2115])

	scaleY
		.range([(graphicH - margin.top - margin.bottom), 0])
		.domain([0, d3.max(data, d => d.population)])

	populationLine
		.x(d => scaleX(+d.year))
		.y(d => scaleY(+d.population))

}


function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

	const gEnter = svg
		.append('g')
		.attr('class', 'deathPlot')

	const axis = gEnter
		.append('g')
		.attr('class', 'g-axis')

	const x = axis
		.append('g')
		.attr('class', 'axis axis--x')

	const y = axis
		.append('g')
		.attr('class', 'axis axis--y')

	y.append('text')
		.attr('class', 'label')
		.text('Number of captive cetaceans')
		.attr('text-anchor', 'middle')
		.attr('transform', 'rotate(-90)')

}

function setupSliders() {
	const slider1 = graphicSel.select('.lifespan__input')
	const slider2 = graphicSel.select('.breedingban__input')
	
	noUiSlider.create(slider1.node(), {
		start: 20,
		connect: [true, false],
		step: 1,
		range: { min: 15, max: 62 },
	})

	noUiSlider.create(slider2.node(), {
		start: 2030,
		connect: [true, false],
		step: 1,
		range: { min: 2017, max: 2050 },
	})

	slider1.node().noUiSlider.on('update', function slide() {
		ageSliderValue = +this.get()
		spanLifespanSel.text(ageSliderValue)
		calculateData(ageSliderValue, breedingSliderValue)
		updateDOM(predictionData)
	})

	slider2.node().noUiSlider.on('update', function slide() {
		breedingSliderValue = +this.get()
		spanBreedingbanSel.text(breedingSliderValue)
		calculateData(ageSliderValue, breedingSliderValue)
		updateDOM(predictionData)
	})
}



function updateDOM(data) {

	updateScales(data)
	updateAxis(data)

	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('g')

	g.attr('transform', translate(margin.left, margin.top))

	const plot = g.select('.deathPlot')

	const line = g.selectAll('.deathLine')
		.data([data])


	const lineEnter = line.enter()
		.append('path')
		.attr('class', 'deathLine')
		.attr('d', populationLine)

	// exit
	line.exit().remove()

	// update

	const lineMerge = lineEnter.merge(line)
	
	lineMerge
		.attr('d', populationLine)
}

function updateAxis(data) {
	const axis = graphicSel.select('.g-axis')

	const axisLeft = d3.axisLeft(scaleY).tickSize(-graphicW + margin.left + margin.right)
		.ticks(desktop ? 10 : 5)
	const axisBottom = d3.axisBottom(scaleX)
		.ticks(desktop ? 10 : 5)
		.tickSize(0)
		.tickPadding(FONT_SIZE / 1.5)

	const x = axis.select('.axis--x')
	const y = axis.select('.axis--y')

	const trim = graphicH - (margin.top + margin.bottom)

	x
		.attr('transform', `translate(0, ${trim})`)
		.call(axisBottom
			.tickFormat(d3.format('d')))

	y
		.call(axisLeft)

	y.select('text')
		.attr('x', -graphicH / 2)
		.attr('y', -margin.left + FONT_SIZE)
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

	maxYear = Math.max.apply(Math, sliderData.map( d => d.deathYear))

	spanExistSel.text(maxYear)

	const cleanNest = d3.range(2017, maxYear).map(i => {
		const key = i.toString()
		const match = nestSlider.find(d => d.key === key)
		if (match) return match
			else return { key, value: 0}
	})


	const births = d3.range(breedingSliderValue, maxYear ).map(i => ({birthYear: i, count: 0})) 

	const birthsAll = newYears.concat(births)

	const cleanedBirths = d3.range(2017, maxYear ).map( i => {
		const birthYear = i
		const match = birthsAll.find(d => d.birthYear === birthYear)
		if (match) return match
			else return { birthYear: birthYear, count: 0}
	})

	cleanedBirths.forEach(d => d.deathYear = Math.max((ageSliderValue + d.birthYear), 2017))


	predictionData = d3.range(2017, maxYear  ).map(i => ({year: i, population: 500}))

	let population = 563
	for (let i = 0; i < predictionData.length; i++){
		predictionData[i].population = population
		population += cleanedBirths[i].count
		population -= cleanNest[i].value
	}


	predictionData.push({year: maxYear , population: 0})



}


function setup() {
	setupDOM()
	setupSliders()
	calculateData(20, 2030)
	resize()


}

function resize() {
	updateDimensions()
	resizeGraphic()
	updateDOM(predictionData)
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