import * as d3 from 'd3'
import loadData from './load-data-orca-death'
import './polyfills/find'

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--orcaDeath')
const graphicSel = containerSel.select('.orcaDeath__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')

let birthData = []
let predictionDataLow = []
let predictionDataHigh = []
let margin = {top: 200, bottom: 25, left: 100, right: 50}
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false
let population = 24

const scaleX = d3.scaleLinear()
const scaleY = d3.scaleLinear()

const populationLine = d3.line()

function calculateData(){

	// high estimate
	const highData = birthData

	highData.forEach(d => d.deathYear = Math.max((52 + d.birthYear), 2017))

	let nestHigh = d3.nest()
		.key(d => +d.deathYear)
		.rollup(leaves => d3.sum(leaves, d => d.count))
		.entries(highData)

	const maxYearHigh = Math.max.apply(Math, highData.map( d => d.deathYear))

	const allHighData = d3.range(2017, maxYearHigh).map(i => {
		const key = i.toString()
		const match = nestHigh.find(d => d.key === key)
		if (match) return match
			else return { key, value: 0}
	})

	predictionDataHigh = d3.range(2017, maxYearHigh).map(i => ({year: i, population: 500}))

	let populationH = 24
	for (let i = 0; i < predictionDataHigh.length; i++){
		predictionDataHigh[i].population = populationH
		populationH -= allHighData[i].value
	}

	// low estimate

	const lowData = birthData

	lowData.forEach(d => d.deathYear = Math.max((16 + d.birthYear), 2017))

	let nestLow = d3.nest()
		.key(d => +d.deathYear)
		.rollup(leaves => d3.sum(leaves, d => d.count))
		.entries(lowData)

	const maxYearLow = Math.max.apply(Math, lowData.map( d => d.deathYear))

	const allLowData = d3.range(2017, maxYearLow).map(i => {
		const key = i.toString()
		const match = nestLow.find(d => d.key === key)
		if (match) return match
			else return { key, value: 0}
	})

	predictionDataLow = d3.range(2017, maxYearLow).map(i => ({year: i, population: 500}))

	let population = 24
	for (let i = 0; i < predictionDataLow.length; i++){
		predictionDataLow[i].population = population
		population -= allLowData[i].value
	}

}



function translate(x, y) {	

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
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
		.range([0, (graphicW - (margin.left + margin.right))])
		.domain([2017, d3.max(data, d => d.year)])

	scaleY
		.range([(graphicH - margin.top - margin.bottom), 0])
		.domain([0, d3.max(data, d => d.population)])

	populationLine
		.x(d => scaleXchart(+d.year))
		.y(d => scaleYchart(+d.population))
}


function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

	const gEnter = svg
		.append('g')
		.attr('class', 'orcaDeathPlot')

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




function setup() {
	setupDOM()
	resize()
	calculateData()

}

function resize() {
/*	updateDimensions()
	resizeGraphic()
	updateScales(predictionData)
	updateDOM(predictionData)*/
}


function init() {
	loadData()
		.then((result) => {
			birthData = result
			setup()
		})
		.catch(err => console.log(err))
}

export default { init, resize }