import * as d3 from 'd3'
import ScrollMagic from 'scrollmagic'
import loadData from './load-data'

const controller = new ScrollMagic.Controller({ refreshInterval: 0 })

let viewportHeight = 0
let width = 0
let height = 0
let chartWidth = 0
let chartHeight = 0

let desktop = false
let enterExitScene = null
let timelineData = null
let nestedData = null

const margin = 50
const scaleX = d3.scaleBand()
const scaleY = d3.scaleLinear()

const stepScenes = []

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--scroll')
const graphicSel = containerSel.select('.scroll__graphic')
const proseSel = containerSel.select('.scroll__prose')
const stepSel = containerSel.selectAll('.prose__step')
const scrollSel = containerSel.select('.scroll')


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

function updateChart({ step, down }) {
	console.log(step)
	const barsSel = d3.selectAll('.bars')

	if (step === '1') {
		barsSel
			.attr('fill', 'black')
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


function nest(data){

	timelineData = data[0]

	nestedData = d3.nest()
		.key( d => d.AcqYear )
		.sortKeys(d3.ascending)
		.rollup( values => values.length )
		.entries(data[0])
}


function translate(x, y) {
	return `translate(${x}, ${y})`
}


function enter({ container, data }){
	const svg = container.selectAll('svg').data([data])
	const svgEnter = svg.enter().append('svg')
	const gEnter = svgEnter.append('g')

	gEnter.append('g').attr('class', 'timelinePlot')

	const axis = gEnter.append('g').attr('class', 'g-axis')

	const x = axis.append('g').attr('class', 'axis axis--x')

	const y = axis.append('g').attr('class', 'axis axis--y')
}

function exit({ container, data }){

}

function updateScales({ data }) {
	scaleX
		.rangeRound([0, width])
		.padding(0.1)
		.domain(nestedData.map(d => +d.key))

		console.log([nestedData.map(d => +d.key)])

console.log(width)
console.log(height)

	scaleY
		.range([height, 0])
		.domain([0, d3.max(data, d => d.value)])
}

function updateDom({ container, data }) {
	const svg = container.select('svg')

	svg
		.attr('width', width)
		.attr('height', height)

	const g = svg.select('g')

	g.attr('transform', translate(margin, margin))

	const plot = g.select('.timelinePlot')

	const bar = plot.selectAll('.bars').data(nestedData)

	bar.enter().append('rect')
			.attr('class', 'bars')
		.merge(bar)
			.attr('x', d => scaleX(d.key))
			.attr('y', d => scaleY(d.value))
			.attr('width', scaleX.bandwidth())
			.attr('height', d => height - scaleY(d.value))
}

function updateAxis({ container, data }) {
	const axis = container.select('.g-axis')

	const axisLeft = d3.axisLeft(scaleY)
	const axisBottom = d3.axisBottom(scaleX).ticks(10)

	const x = axis.select('.axis--x')
	const y = axis.select('.axis--y')

	const maxY = scaleY.range()[0]
	const offset = maxY

	x
		.attr('transform', translate(0, height))
		.call(axisBottom
			.ticks(5))

	y.call(axisLeft)
}

function chart(container) {
	const data = nestedData
	enter({ container, data })
	exit({ container, data })
	updateScales({ container, data })
	updateDom({ container, data })
	updateAxis({ container, data })
}

	chart.width = function(...args) {
		if (!args.length) return width
		width = args[0]
		chartWidth = width - margin * 2
		return chart
	}


	chart.height = function(...args) {
		if (!args.length) return height
		height = args[0]
		chartHeight = height - margin * 2
		return chart
	}


function updateDimensions() {
	width = scrollSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 800px)').matches
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

function setupChart(){
	updateDimensions()
	graphicSel.datum([])
	graphicSel.call(chart)
}

function resizeGraphic() {
	const ratio = 1.5
	const proseW = proseSel.node().offsetWidth
	const graphicW = desktop ? width - proseW : width
	const graphicH = graphicW / ratio

	graphicSel
		.style('width', `${graphicW}px`)
		.style('height', `${height}px`)

	chart.width(graphicW).height(graphicH)

	graphicSel.call(chart)
}





function resize() {
	updateDimensions()
	resizeGraphic()
	resizeScrollElements()
}

function setup(data) {
	setupChart()
	resize()
	setupScroll()
	updateChart({ step: '1', down: true})
}

function init() {
	loadData()
		.then(nest)
		.then(setup)
		.catch(err => console.log(err))
}


export default { init, resize }
