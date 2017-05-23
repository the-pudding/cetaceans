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
let nestedData = null

const margin = 30
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
	
	updateDom(nestedData)
	updateScales(nestedData)
	updateAxis(nestedData)

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


function enter(){
	const svg = graphicSel.selectAll('svg').data([nestedData])


	const svgEnter = svg.enter().append('svg')
	const gEnter = svgEnter.append('g').attr('class', 'plotG')

	gEnter.append('g').attr('class', 'timelinePlot')

	const axis = gEnter.append('g').attr('class', 'g-axis')

	const x = axis.append('g').attr('class', 'axis axis--x')

	const y = axis.append('g').attr('class', 'axis axis--y')
}

function updateScales( data ) {
	scaleX
		.rangeRound([0, graphicW])
		.padding(0.1)
		.domain(nestedData.map(d => +d.key))

	scaleY
		.range([graphicH, 0])
		.domain([0, d3.max(data, d => d.value)])
}

function updateDom({ container, data }) {

	const svg = graphicSel.select('svg')
		.attr('width', graphicW)
		.attr('height', graphicH)

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
			.attr('height', d => graphicH - scaleY(d.value) )
}

function updateAxis({ container, data }) {
	const axis = graphicSel.select('.g-axis')

	const axisLeft = d3.axisLeft(scaleY)
	const axisBottom = d3.axisBottom(scaleX).ticks(10)

	const x = axis.select('.axis--x')
	const y = axis.select('.axis--y')

	//const maxY = scaleY.range()[0]
	//const offset = maxY

	x
		.attr('transform', `translate(0, ${graphicH})`)
		.call(axisBottom
			.ticks(5))

	y.call(axisLeft)
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

	console.log(height)

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

	graphicSel.select('svg')
		.attr('width', graphicH)
		.attr('height', graphicW)

}





function resize() {
	updateDimensions()
	resizeScrollElements()
	resizeGraphic()
}

function setup(data) {
	enter()
	resize()
	setupScroll()
	updateChart({ step: '1', down: true })

}

function init() {
	loadData()
		.then(nest)
		.then(setup)
		.catch(err => console.log(err))
}


export default { init, resize }
