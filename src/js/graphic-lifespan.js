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

const FONT_SIZE = 12

const scaleX = d3.scaleBand()
const scaleY = d3.scaleLinear()
const scaleColor = chroma.scale(['#376056','#f4f465'])
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

	const axis = gEnter
		.append('g')
		.attr('class', 'g-axis')

	const x = axis
		.append('g')
		.attr('class', 'axis axis--x')

	const y = axis
		.append('g')
		.attr('class', 'axis axis--y')

	const z = axis
		.append('g')
		.attr('class', 'axis axis--z')

	// Adding arrowhead
	const xLine = x.append('line')

	x.append('defs')
		.append('marker')
		.attr('id', 'life-arrow')
		.attr('refX', 6)
		.attr('refY', 4)
		.attr('markerWidth', 12)
		.attr('markerHeight', 12)
		.attr('orient', 'auto')
		.append('path')
		.attr('d', 'M 1 1 7 4 1 7 Z')

	xLine.attr('marker-end', 'url(#life-arrow)')

	const age = x.append('g').attr('class', 'g-age')
	const ageItem = age.selectAll('g').data([10, 20, 30, 40, 50, 60])
		.enter().append('g')
			.attr('class', 'age')

	ageItem.append('rect')
	ageItem.append('text')
		.text((d, i) => i === 0 ? `${d} years` : d)
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')


	z.append('text')
		// .attr('transform', 'rotate(-90)')
		.attr('class', 'living')
		.attr('text-anchor', 'middle')
		.text('Living')

	z.append('text')
		// .attr('transform', 'rotate(-90)')
		.attr('class', 'deceased')
		.attr('text-anchor', 'middle')
		.text('Deceased')

	y.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('class', 'count')
		.attr('text-anchor', 'middle')
		.text('Count')
}


function updateDOM(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('.lifespanPlot')

	g.attr('transform', translate(margin.right, margin.top))

	const bar = g.selectAll('.bar')
		.data(data, d => `${d.age}-${d.status}`)

	// enter

	const barEnter = bar.enter().append('rect')
		.attr('class', 'bar')
		.attr('transform', d => `translate(0, ${scaleY(0) + ((d.count > 0 ? -1 : 1) * FONT_SIZE)})`)
		.attr('x', d => scaleX(d.age))
		.attr('y', 0)
		.attr('width', scaleX.bandwidth())
		.attr('height', 0)
		.style('fill', d => scaleColor(d.age))


	// exit
	bar.exit()
		.transition()
		.duration(750)
		.delay(d => 100 + d.age * 10)
		.ease(d3.easeCubicInOut)
		.attr('y', 0)
		.attr('height', 0)
		// .style('opacity', 0)
		.remove()

	// update

	const barMerge = barEnter.merge(bar)

	barMerge.transition()
		.duration(750)
		.ease(d3.easeCubicInOut)
		.delay(d => 100 + d.age * 10)
		.attr('x', d => scaleX(d.age))
		.attr('y', d => d.count > 0 ? scaleY(d.count) - scaleY(0) : 0)
		.attr('width', scaleX.bandwidth())
		.attr('height', d => (Math.abs(scaleY(d.count) - scaleY(0))))
		// .style('opacity', 1)

	const line = g.select('.axis--x line')

	line
		.attr('x1', scaleX.bandwidth())
		.attr('x2', scaleX.range()[1] + scaleX.bandwidth())
		.attr('y1', scaleY(0))
		.attr('y2', scaleY(0))

	const age = g.selectAll('.age')
	
	age.attr('transform', d => `translate(${scaleX(d) + scaleX.bandwidth() / 2}, ${scaleY(0)})`)

	const rectW = scaleX.bandwidth() * 2.5
	const rectH = FONT_SIZE * 1.5

	age.select('rect')
		.attr('x', (d, i) => -rectW / 2 * (i === 0 ? 2 : 1))
		.attr('y', -rectH / 2)
		.attr('width', (d, i) => rectW  * (i === 0 ? 2 : 1))
		.attr('height', rectH)

	const offText = scaleY(0) / 1.5
	g.select('.axis--z .living')
		.attr('y', scaleY(0) - offText)
		.attr('x', scaleX(41))

	g.select('.axis--z .deceased')
		.attr('y', scaleY(0) + offText + FONT_SIZE)
		.attr('x', scaleX(41))

	g.select('.axis--y text')
		.attr('y', 0)
		.attr('x', -scaleY(0))
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