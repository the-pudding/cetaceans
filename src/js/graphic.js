import * as d3 from 'd3'
import ScrollMagic from 'scrollmagic'
import loadData from './load-data'

const controller = new ScrollMagic.Controller({ refreshInterval: 0 })

let viewportHeight = 0
let width = 0
let height = 0
let graphicW = 0
let graphicH = 0

let desktop = false
let enterExitScene = null
let timelineData = null
let stackedData = null

let Acq = ['capture', 'born', 'rescue']


const margin = 30
const scaleX = d3.scaleBand()
//const scaleX = d3.scaleTime()
const scaleY = d3.scaleLinear()
let svg = null

const formatYear = d3.timeFormat("%Y")
const parseYear = d3.timeParse("%Y")


const stepScenes = []

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--scroll')
const graphicSel = containerSel.select('.scroll__graphic')
const proseSel = containerSel.select('.scroll__prose')
const stepSel = containerSel.selectAll('.prose__step')
const scrollSel = containerSel.select('.scroll')

const color = d3.scaleOrdinal(d3.schemeCategory20)



function setupStep() {
	const el = this
	const selection = d3.select(this)
	const triggerHook = 0.5

	const scene = new ScrollMagic.Scene({
		triggerElement: el,
		duration: el.offsetHeight,
		triggerHook,
	})

	scene
		.on('enter', (event) => {
			const step = selection.attr('data-step')
			const down = event.scrollDirection === 'FORWARD'
			updateChart({ step: step, down: down })
		})
		.on('leave', (event) => {
			const step = selection.attr('data-step')
			const down = event.scrollDirection === 'FORWARD'
			updateChart({ step: step, down: down })
		})
		.addTo(controller)

	stepScenes.push(scene)
}

function setupEnterExit() {
	// create a scene to toggle fixed position
	const proseEl = proseSel.node()

	enterExitScene = new ScrollMagic.Scene({
		triggerElement: proseEl,
		triggerHook: 0,
		duration: proseEl.offsetHeight - window.innerHeight,
		loglevel: 0,
	})

	enterExitScene
		.on('enter', (event) => {
			graphicSel.classed('is-fixed', true)
			const bottom = event.scrollDirection === 'REVERSE'
			if (bottom) graphicSel.classed('is-bottom', false)
				console.log(graphicSel.classed('is-bottom'))
		})
		.on('leave', (event) => {
			graphicSel.classed('is-fixed', false)
			const bottom = event.scrollDirection === 'FORWARD'
			if (bottom) graphicSel.classed('is-bottom', true)
		})
		.addTo(controller)
}

function setupScroll(){
	stepSel.each(setupStep)
	setupEnterExit()
}


function gettingData(data){

	timelineData = data[0]

	const stacked = d3.stack()
		.keys(['capture', 'born', 'rescue'])
		.order(d3.stackOrderNone)
		.offset(d3.stackOffsetNone)

		console.log(stacked)

	stackedData = stacked(timelineData)

}

function translate(x, y) {	

	return `translate(${x}, ${y})`
}


function updateDimensions() {
	width = scrollSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 800px)').matches

	console.log(window.innerHeight)
}

function resizeScrollElements() {
	const factor = desktop ? 0.67 : 1
	const h = Math.floor(height * factor)
	stepSel.style('height', `${h}px`)

	if (enterExitScene) {
		const proseEl = proseSel.node()
		const duration = proseEl.offsetHeight - height
		enterExitScene.duration(duration)

		stepScenes.forEach(scene => scene.refresh())
		controller.update(true)
	}
}


function resizeGraphic() {
	const ratio = 1.5
	const proseW = proseSel.node().offsetWidth
	graphicW = desktop ? width - proseW : width
	graphicH = graphicW / ratio

	graphicSel
		.style('width', `${graphicW}px`)
		.style('height', `${height}px`)

	const trim = graphicH - margin

	graphicSel.select('svg')
		.attr('width', graphicW)
		.attr('height', trim)

		console.log(graphicH)
		console.log(graphicH-margin)
}



function enter(){
	svg = graphicSel
		.selectAll('svg')
		.data([stackedData])


	const svgEnter = svg
		.enter()
		.append('svg')

	const gEnter = svgEnter
		.append('g')
		.attr('class', 'plotG')

	gEnter
		.append('g')
		.attr('class', 'timelinePlot')

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


function updateScales( data ) {
	const trimW = graphicW - margin
	const trimH = graphicH - (margin * 2)

	scaleX
		.rangeRound([0, trimW])
		.padding(0.1)
		.domain(stackedData[0].map(d => d.data.year))

	scaleY
		.range([trimH, 0])
		//.domain([0, d3.max(stackedData, d => d[0] + d[1])])
		//.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[0] + d[1])])
		//.domain([0, d3.max(stackedData[stackedData.length - 1], function(d) { return d[0] + d[1]; }) ])
		.domain([0, 178])
		//console.log(stackedData[stackedData.length-2])
}



function updateDom({ container, data }) {

	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('g')

	g.attr('transform', translate(margin, margin))

	const plot = g.select('.timelinePlot')

	const plotGroup = plot.selectAll('.layers')
		.data(stackedData)
		.enter().append("g")
		.attr("class", "layers")
		.style("fill", function(d, i){return color(i)})


	const bar = plotGroup.selectAll('.bars').data(d => d)

	bar.enter().append('rect')
			.attr('class', 'bars')
		.merge(bar)
			.attr('x', d => scaleX(d.data.year))
			.attr('y', d => scaleY(d[1]))
			.attr('width', scaleX.bandwidth())
			.attr('height', d => (scaleY(d[0]) - scaleY(d[1])))

}



function updateAxis({ container, data }) {
	const axis = graphicSel.select('.g-axis')

	const axisLeft = d3.axisLeft(scaleY)
	const axisBottom = d3.axisBottom(scaleX).tickValues(["1940", "1950", "1960", "1970", "1980", "1990", "2000", "2010"])

	const x = axis.select('.axis--x')
	const y = axis.select('.axis--y')

	const trim = graphicH - (margin * 2)

	x
		.attr('transform', `translate(0, ${trim})`)
		.call(axisBottom)

	y
		.call(axisLeft)
}


function updateChart({ step, down }) {


	const barsSel = d3.selectAll('.bars')

	if (step === '1') {
		barsSel
			//.attr('fill', 'black')
	}

	if (step === '2') {
		barsSel
			.attr('fill', 'red')
	}

	if (step === '3') {
		barsSel
			.attr('fill', 'blue')
	}
}


function resize() {
	updateDimensions()
	resizeScrollElements()
	resizeGraphic()
	updateScales(stackedData)
	updateAxis(stackedData)
	updateDom(stackedData)
}

function setup(data) {
	enter()
	resize()
	setupScroll()
	updateChart({ step: '1', down: true })

}

function init() {
	loadData()
		.then(gettingData)
		.then(setup)
		.catch(err => console.log(err))
}


export default { init, resize }
