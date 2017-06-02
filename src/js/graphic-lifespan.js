import * as d3 from 'd3'
import loadData from './load-data-lifespan'

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--lifespan')
const graphicSel = containerSel.select('.lifespan__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')

let lifespanData = []
let filteredData = []

let margin = {top: 50, bottom: 50, left: 100, right: 50}
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false

const scaleX = d3.scaleBand()
const scaleY = d3.scaleLinear()

function translate(x, y) {	

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
}



function filterData(animals){
	filteredData = lifespanData.filter(d => d.animals == animals && d.age > 0)
}

function updateScales(data) {
	const trimW = graphicW - (margin.left + margin.right)
	const trimH = graphicH - (margin.top + margin.bottom)

	console.log(data)

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

		console.log(graphicContainerSel)

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


function updateDOM(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('.lifespanPlot')

	g.attr('transform', translate(margin.right, margin.top))

/*	const plot = g.select('.lifespanPlot')*/

	const bar = g.selectAll('.bar')
		.data(data)

		console.log(bar)

	// enter
	const barEnter = bar.enter().append('rect')
		.attr('class', 'bar')
		.attr('x', d => scaleX(d.age))
		.attr('y', d => { if (d.count > 0){ return scaleY(d.count) - 5}
			else { return scaleY(0) +5}})
		.attr('width', scaleX.bandwidth())
		.attr('height', d => (Math.abs(scaleY(d.count) - scaleY(0))))

		console.log(scaleX.bandwidth())

	// exit
	bar.exit().remove()

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
	graphicH = graphicW / ratio

	graphicSel
		.style('height', `${graphicH}px`)
}


function setup() {
	filterData("All")
	setupDOM()
	resize()
	updateDOM(filteredData)
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
			console.log(lifespanData)
			setup()
		})
		.catch(err => console.log(err))
}

export default { init, resize }