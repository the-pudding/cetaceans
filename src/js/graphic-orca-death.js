import loadData from './load-data-orca-death'
import './polyfills/find'
import * as svgAnnotation from 'd3-svg-annotation'

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--orcaDeath')
const graphicSel = containerSel.select('.orcaDeath__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')

let birthData = []
let predictionDataLow = []
let predictionDataHigh = []
let allPredictionData = []
let margin = {top: 20, bottom: 30, left: 36, right: 36}
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0
let desktop = false
let population = 24

const FONT_SIZE = 12

const scaleX = d3.scaleLinear()
const scaleY = d3.scaleLinear()

const populationLine = d3.line()
const areaFill = d3.area()

let circleR = 5
let padding = 2

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

	predictionDataHigh.push({year: maxYearHigh + 1, population: 0})
	predictionDataHigh.forEach(d => d.Level = "High")



	// low estimate

	const lowData = birthData

	lowData.forEach(d => d.deathYear = Math.max((22 + d.birthYear), 2017))

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

	predictionDataLow.push({year: maxYearLow, population: 0})

	predictionDataLow.forEach(d => d.Level = "Low")

	const bothPredictionData = predictionDataHigh.concat(predictionDataLow)

	allPredictionData = d3.nest()
		.key(d => d.Level)
		.entries(bothPredictionData)



}


function translate(x, y) {	

	return `translate(${x}, ${y})`
}

function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 600px)').matches

}

function resizeGraphic() {
	const ratio = desktop ? 1.75 : 1
	graphicW = width
	graphicH = height * 0.65

}

function updateScales(data) {

	scaleX
		.range([0, (graphicW - (margin.left + margin.right))])
		.domain([2017, 2070])

	scaleY
		.range([(graphicH - margin.top - margin.bottom), 0])
		.domain([0, 25])

	populationLine
		.x(d => scaleX(+d.year))
		.y(d => scaleY(+d.population))

	areaFill
		.x(d => scaleX(d.year))
		.y0(graphicH- margin.top - margin.bottom)
		.y1(d => scaleY(d.population))


}


function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

	const gEnter = svg
		.append('g')
		.attr('class', 'plotG')

	const orcaPlot = gEnter
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

	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)


	const g = svg.select('.plotG')

	g.attr('transform', translate(margin.right, margin.top))

	const plot = g.select('.orcaDeathPlot')

	const level = plot.selectAll('.level')
		.data(data/*, d => d.key*/)

	const levelEnter = level.enter().append('g')
		.attr('class', d => `level level--${d.key}`)

	level.exit()
		.remove()

	const levelMerge = levelEnter.merge(level)





	// Creating a clipping path
	const lowerArea = plot.selectAll('.level--Low')


	const clip = lowerArea.selectAll('#areaClip').data(d => [d.values])

	const clipEnter = clip.enter()
/*		.append('clipPath')*/
		.append('path')
			.attr('id', 'areaClip')
			.attr('d', areaFill)

	clip.exit().remove()

	const clipMerge = clipEnter.merge(clip)

	clipMerge.attr('d', areaFill)



	// ANNOTATIONS


	const lineData = [{'id': 'data', 'x': 2017, 'y': 'other' }]


	const xAnnGroup = plot.selectAll('.xAnnGroup')
		.data(lineData)

	const xAnnGroupEnter = xAnnGroup.enter().append('g')
		.attr('class', 'xAnnGroup')

	xAnnGroup.exit().remove()

	const xAnnGroupMerge = xAnnGroupEnter.merge(xAnnGroup)


	// drawing line along x axis
	const xAnn = xAnnGroupMerge.selectAll('.xAnnLine').data(lineData)

	const xAnnEnter = xAnn.enter()
		.append('line')
		.attr('class', 'xAnnLine')
		.attr('x1', scaleX(2017))
		.attr('x2', scaleX(2070))
		.attr('y1', scaleY(0))
		.attr('y2', scaleY(0))
		.attr('class', 'xAnnLine')
		

	xAnn.exit().remove()

	const xAnnMerge = xAnnEnter.merge(xAnn)

	xAnnMerge
		.attr('x1', scaleX(2017))
		.attr('x2', scaleX(2070))
		.attr('y1', scaleY(0))
		.attr('y2', scaleY(0))


	// Adding text
	const xAnnTextLabel = xAnnGroupMerge.selectAll('.xAnnTextLabel').data(lineData)

	const xAnnTextEnter = xAnnTextLabel.enter()
		.append('text')
		.attr('class', 'xAnnTextLabel')
		.attr('x', scaleX(2017))
		.attr('y', scaleY(0) - 1)
		.attr('transform', `translate(0, ${graphicW * 0.005})`)
		.text(`${desktop ? 'zero' : '0'} orcas by`)

	xAnnTextLabel.exit().remove()

	const xAnnTextMerge = xAnnTextEnter.merge(xAnnTextLabel)

	xAnnTextMerge
		.attr('x', scaleX(2017))
		.attr('y', scaleY(0))
		.attr('transform', `translate(0, ${graphicW * 0.005})`)


	// Adding rectangle behind text
	let xTextMeas = d3.select('.xAnnTextLabel')
	let bboxX = xTextMeas.node().getBBox()
	

	const xRect = xAnnGroupMerge.selectAll('.xRect').data(lineData)

	const xRectEnter = xRect.enter()
		.append('rect')
		.attr('class', 'xRect')


	xRect.exit().remove()

	const xRectMerge = xRectEnter.merge(xRect)

	xRectMerge
		.attr('x', bboxX.x - padding)
		.attr('y', bboxX.y - padding)
		.attr('width', bboxX.width + (padding*2))
		.attr('height', bboxX.height + (padding * 2))

	xAnnTextMerge.raise()


		// Adding text
	const yearAnn1 = xAnnGroupMerge.selectAll('.yearAnn1').data(lineData)

	const yearAnn1Enter = yearAnn1.enter()
		.append('text')
		.attr('class', 'yearAnn1')
		.attr('x', scaleX(2039))
		.attr('y', scaleY(0) + circleR * 1.5)
		.attr('alignment-baseline', 'hanging')
		.attr('text-anchor', 'middle')
		.text('2039')


	yearAnn1.exit().remove()

	const yearAnn1Merge = yearAnn1Enter.merge(yearAnn1)

	yearAnn1Merge
		.attr('x', scaleX(2039))
		.attr('y', scaleY(0) + circleR * 1.5)




			// Adding text
	const yearAnn2 = xAnnGroupMerge.selectAll('.yearAnn2').data(lineData)

	const yearAnn2Enter = yearAnn2.enter()
		.append('text')
		.attr('class', 'yearAnn2')
		.attr('x', scaleX(2070))
		.attr('y', scaleY(0) + circleR * 1.5)
		.attr('alignment-baseline', 'hanging')
		.attr('text-anchor', 'middle')
		.text('2070')

	yearAnn2.exit().remove()

	const yearAnn2Merge = yearAnn2Enter.merge(yearAnn2)

	yearAnn2Merge
		.attr('x', scaleX(2070))
		.attr('y', scaleY(0) + circleR * 1.5)



	// Filling in the area

	const upperArea = plot.selectAll('.level--High')

	const area = upperArea.selectAll('.area').data(d => [d.values])

	const areaEnter = area.enter()
		.append('path')
		.attr('class', 'area')
		.attr('d', areaFill)
		

	area.exit().remove()

	const areaMerge = areaEnter.merge(area)

	areaMerge.attr('d', areaFill)


	// Drawing lines
	const line = levelMerge.selectAll('.line').data(d => [d.values])


	const lineEnter = line.enter()
		.append('path')
		.attr('class', (d, i) => `line line--${d.Level}`)
		.attr('d', populationLine)


		// exit
	line.exit().remove()

	// update

	const lineMerge = lineEnter.merge(line)
	
	lineMerge.attr('d', populationLine)
		
	// Adding circles

	const circleData = [{
		id: 'endHigh',
		x: 2070,
		y: 0
	},{
		id: 'endLow',
		x: 2039,
		y: 0
	},{
		id: 'beginning',
		x: 2017,
		y: 24
	}]

	const circle = plot.selectAll('.circle').data(circleData)

	const circleEnter = circle.enter()
		.append('circle')
		.attr('class', d => `circle circle--${d.id}`)
		.attr('cx', d => scaleX(d.x))
		.attr('cy', d => scaleY(d.y))
		.attr('r', `${circleR}`)

	circle.exit().remove()

	const circleMerge = circleEnter.merge(circle)

	circleMerge
		.attr('cx', d => scaleX(d.x))
		.attr('cy', d => scaleY(d.y))
		.attr('r', `${circleR}`)






	// Adding Y line element

	const populationGroup = plot.selectAll('.popG').data(lineData)

	const popGroupEnter = populationGroup.enter()
		.append('g')
		.attr('class', 'popG')

	populationGroup.exit().remove()

	const popGroupMerge = popGroupEnter.merge(populationGroup)

	popGroupMerge.attr('transform', `translate(${-FONT_SIZE * 2}, 0)`)

	// Adding arrowhead to population line
	const arrow = popGroupMerge.selectAll('.popArrow').data(lineData)

	const arrowEnter = arrow.enter()
		.append('defs')
		.append('marker')
		.attr('id', 'arrowHead')
	    .attr("refX", 6)
	    .attr("refY", 4)
	    .attr("markerWidth", 12)
	    .attr("markerHeight", 12)
	    .attr("orient", "auto-start-reverse")
	    .append("path")
	    .attr('d', 'M 1 1 7 4 1 7 Z')



	// Adding line

	const populationLabel = popGroupMerge.selectAll('.popLine').data(lineData)

	const popEnter = populationLabel.enter()
		.append('line')
		.attr('class', 'popLine')
		.attr('x1', scaleX(2017))
		.attr('x2', scaleX(2017))
		.attr('y1', scaleY(24))
		.attr('y2', scaleY(0))
		.attr('class', 'popLine')
		.attr("marker-start", "url(#arrowHead)");

	populationLabel.exit().remove()

	const popMerge = popEnter.merge(populationLabel)

	popMerge
		.attr('x1', scaleX(2017))
		.attr('x2', scaleX(2017))
		.attr('y1', scaleY(0))
		.attr('y2', scaleY(24))


	// Adding Text

	const populationText = popGroupMerge.selectAll('.popText').data(lineData)

	const popTextEnter = populationText.enter()
		.append('text')
		.attr('class', 'popText')
		.attr('transform', `translate(${0}, ${graphicH/2}) rotate(-90)`)
		.attr('y', FONT_SIZE / 2 - 1)
		.text('population')

	populationText.exit().remove()

	const popTextMerge = popTextEnter.merge(populationText)

	popTextMerge.attr('transform', `translate(${0}, ${graphicH/2}) rotate(-90)`)


	// Adding rectangle behind text
	let popTextMeas = d3.select('.popText')
	let bbox = popTextMeas.node().getBBox()
	

	const popRect = popGroupMerge.selectAll('.popRect').data(lineData)

	const popRectEnter = popRect.enter()
		.append('rect')
		.attr('x', bbox.x - padding)
		.attr('y', bbox.y - padding)
		.attr('width', bbox.width + (padding*2))
		.attr('height', bbox.height + (padding*2))
		.attr('class', 'popRect')
		.attr('transform', `translate(${0}, ${graphicH/2}) rotate(-90)`)

	popRect.exit().remove()

	const popRectMerge = popRectEnter.merge(popRect)

	popRectMerge
		.attr('x', bbox.x - padding)
		.attr('y', bbox.y - padding)
		.attr('width', bbox.width + (padding*2))
		.attr('height', bbox.height + (padding*2))
		.attr('transform', `translate(0, ${graphicH/2}) rotate(-90)`)

	// Raise text on top of background rectangle
	popTextMerge.raise()

}

function addAnnotations(){
	d3.selectAll(".annotation-group").remove();

	const type = svgAnnotation.annotationCustomType(
  		svgAnnotation.annotationLabel, 
		  {"className":"custom",
		    "note":{"align":"middle",
		    "lineType":"vertical"}})


	const annotations = [
	{
	  note: { label: 'If all animals live to minimum life expectancy (22 years)'},
	  className: 'low',
	  data: { year: 2030, population: 8 },
	  dy: 0,
	  dx: 0
	},	{
	  note: { label: 'If all animals lived to max observed age (52 years)'},
	  className: 'high',
	  data: { year: 2045, population: 15 },
	  dy: 0,
	  dx: 0
	}, {
	  note: { label: '24 orcas in 2017'},
	  className: 'now', 
	  data: { year: 2017, population: 24},
	  dx: circleR,
	  dy: 0
	}, ]

	const makeAnnotations = svgAnnotation.annotation()
	  .notePadding(15)
	  .type(type)
	  .accessors({
	    x: d => scaleX(d.year),
	    y: d => scaleY(d.population)
	  })
	  .accessorsInverse({
	     date: d => scaleX.invert(d.x),
	     close: d => scaleY.invert(d.y)
	  })
	  .annotations(annotations)

	d3.select(".orcaDeathPlot")
	  .append("g")
	  .attr("class", "annotation-group")
	  .call(makeAnnotations)

}

function updateAxis(data) {
	const axis = graphicSel.select('.g-axis')

	const axisLeft = d3.axisLeft(scaleY)
	const axisBottom = d3.axisBottom(scaleX)

	const x = axis.select('.axis--x')
	const y = axis.select('.axis--y')

	const trim = graphicH - (margin.top + margin.bottom)



	x
		.attr('transform', `translate(0, ${trim})`)
		.call(axisBottom
			.tickFormat(d3.format('d')))

	y
		.attr('transform', `translate(0, 0)`)
		.call(axisLeft
			.ticks(0))
}




function setup() {
	setupDOM()
	calculateData()
	resize()


}

function resize() {
	updateDimensions()
	resizeGraphic()
	updateScales(allPredictionData)
	updateDOM(allPredictionData)
	updateAxis(allPredictionData)
	addAnnotations()
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