import * as d3 from 'd3'
import loadData from './load-data-lifespan'
import chroma from 'chroma-js'

const bodySel = d3.select('body')
const containerSel = bodySel.select('.section--lifespan')
const graphicSel = containerSel.select('.lifespan__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')
const toggleSel = graphicSel.selectAll('.btn--toggle')

let lifespanData = []
let filteredData = []

let margin = { top: 30, bottom: 30, left: 60, right: 30 }
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false

const scaleX = d3.scaleBand()
const scaleY = d3.scaleLinear()
const scaleColor = chroma.scale(['#426b59', '#76a267', '#dad154'])
		.domain([0, 62])
		.mode('lab')
		.correctLightness()

function translate(x, y) {

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
}


function filterData(animals) {
	filteredData = lifespanData.filter(d => d.animals === animals && d.age > 0)
}

function updateScales(data) {
	const trimW = graphicW - (margin.left + margin.right)
	const trimH = graphicH - (margin.top + margin.bottom)

	scaleX
		.rangeRound([0, trimW])
		.padding(0.1)
/*		.domain(data.map(d => d.age))*/
		.domain(d3.range(0, 62))

	scaleY
		.range([trimH, 0])
		.domain(d3.extent(data, d => d.count))
}


function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

	const gEnter = svg
		.append('g')
		.attr('class', 'lifespanPlot')

/*	gEnter
		.append('g')
		.attr('class', 'lifespanPlot')*/

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

function setupToggle(){
	
}


function updateDOM(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('.lifespanPlot')

	g.attr('transform', translate(margin.right, margin.top))

/*	const plot = g.select('.lifespanPlot')*/

	const bar = g.selectAll('.bar')
		.data(data, d => d.age)

	// enter
	const barEnter = bar.enter().append('rect')
		.attr('class', 'bar')
		.attr('x', d => scaleX(d.age))
		.attr('y', d => { if (d.count > 0){ return scaleY(d.count) - 5}
			else { return scaleY(0) +5}})
		.attr('width', scaleX.bandwidth())
		.attr('height', d => (Math.abs(scaleY(d.count) - scaleY(0))))
		.style('fill', d => scaleColor(d.age))


	// exit
	bar.exit()
		.transition()
		.style('opacity', 0)
		.duration(400)
		.remove()

	// update

	const barMerge = barEnter.merge(bar)
	
	barMerge.transition()
		.duration(400)
		.attr('x', d => scaleX(d.age))
		.attr('y', d => { if (d.count > 0){ return scaleY(d.count) - 5}
			else { return scaleY(0) +5}})
		.attr('width', scaleX.bandwidth())
		.attr('height', d => (Math.abs(scaleY(d.count) - scaleY(0))))
}

function resizeGraphic() {
	const ratio = 1.5
	graphicW = width
	graphicH = height * 0.8
}

function handleToggle(datum, index) {
	const animal = d3.select(this).text()
	filterData(animal)
	updateDOM(filteredData)
	toggleSel.classed('is-selected', (d, i) => i === index)
}

function setupEvents() {
	// toggle click
	toggleSel.on('click', handleToggle)
}


function setup() {
	filterData('All')
	setupDOM()
	resize()
	updateDOM(filteredData)
	setupEvents()
}

function resize() {
	updateDimensions()
	resizeGraphic()
	updateScales(filteredData)
	updateDOM(filteredData)
}


function init() {
	loadData()
		.then((result) => {
			lifespanData = result
			setup()
		})
		.catch(err => console.log(err))
}

export default { init, resize }