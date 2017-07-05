import loadData from './load-data-lifespan'
import chroma from 'chroma-js'
import annotations from 'd3-svg-annotation'

const bodySel = d3.select('body')
const containerSel = bodySel.select('.section--lifespan')
const graphicSel = containerSel.select('.lifespan__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')
const toggleSel = graphicSel.selectAll('.btn--toggle')

let lifespanData = []
let filteredData = []
let annotationData = []
let filteredAnn = []

const FONT_SIZE = 12

let margin = { top: 30, bottom: 10, left: FONT_SIZE, right: FONT_SIZE }

let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false



const scaleX = d3.scaleBand()
const scaleY = d3.scaleLinear()
const scaleColor = chroma.scale(['#267360','#f4f465'])
		.domain([0, 62])
		.mode('lab')
		.correctLightness()

function translate(x, y) {

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 600px)').matches
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

	const gAnnotations = gEnter
		.append('g')
		.attr('class', 'g-annotations')

	const livingAnn = gAnnotations
		.append('g')
		.attr('class', 'annotations annotation-living')

	const deadAnn = gAnnotations
		.append('g')
		.attr('class', 'annotations annotation-dead')

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

	ageItem.append('text')
		.text((d, i) => i === 0 ? `${d} years` : d)
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')
		
	ageItem.append('text')
		.text((d, i) => i === 0 ? `${d} years` : d)
		.attr('text-anchor', 'middle')
		.attr('alignment-baseline', 'middle')


	z.append('text')
		.attr('class', 'living')
		.attr('text-anchor', 'middle')
		.text('Living')

	z.append('text')
		.attr('class', 'deceased')
		.attr('text-anchor', 'middle')
		.text('Deceased')

	y.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('class', 'count')
		.attr('text-anchor', 'middle')
		.text('Number of cetaceans')
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

function setupAnnotations(data){
	const type = annotations.annotationCustomType(
		annotations.annotationCallout,
			{'className': 'custom',
			'note': {'lineType': 'horizontal',
			'align': 'middle'}})

    const makeAnnotations = annotations.annotation()
    	.textWrap(125)
    	.notePadding(5)
    	.type(type)
    	.accessors({
    		x: d => scaleX(d.age),
    		y: d => scaleY(d.count)
    	})
    	.accessorsInverse({
    		Age: d => x.invert(d.x),
    		count: d => y.invert(d.y)
    	})
    	.annotations(data)



    const annotationGroup = graphicContainerSel.select('.g-annotations')
    	.call(makeAnnotations)

}

function generateAnnotationData(){
 annotationData = [{
	  animals: 'All',
	  note: {
	    label: 'average age at death',
	    title: ''
	  },
	  data: { age: 11, count: -39 },
	  dy: 100,
	  dx: 0
	}, {
	  animals: 'All',
	  note: {
	    label: 'maximum age at death in captivity',
	    title: ''
	  },
	  data: { age: 61, count: -1 },
	  dy: 50,
	  dx: 0
	}, {
	  animals: 'All',
	  note: {
	    label: 'average age of living animals',
	    title: ''
	  },
	  data: { age: 18, count: 14 },
	  dy: -150,
	  dx: 0
	},
	{
	  animals: 'Bottlenose',
	  note: {
	    label: 'average age at death',
	    title: ''
	  },
	  data: { age: 9, count: -23 },
	  dy: 130,
	  dx: 0
	}, {
	  animals: 'Bottlenose',
	  note: {
	    label: 'maximum age at death in captivity',
	    title: ''
	  },
	  data: { age: 61, count: -1 },
	  dy: 50,
	  dx: 0
	}, {
	  animals: 'Bottlenose',
	  note: {
	    label: 'average age of living animals',
	    title: ''
	  },
	  data: { age: 15, count: 16 },
	  dy: -200,
	  dx: 0
	}]

}

function filterAnnotation(animal){
	filteredAnn = annotationData.filter(d => d.animals === animal)

}



function resizeGraphic() {
	const ratio = 1.5
	graphicW = width
	graphicH = height * 0.65
}

function handleToggle(datum, index) {
	const animal = d3.select(this).text()
	filterData(animal)
	updateDOM(filteredData)
	filterAnnotation(animal)
	setupAnnotations(filteredAnn)
	toggleSel.classed('is-selected', (d, i) => i === index)
}

function setupEvents() {
	// toggle click
	toggleSel.on('click', handleToggle)
}


function setup() {
	filterData('All')
	generateAnnotationData()
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
	setupAnnotations(filteredAnn)
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