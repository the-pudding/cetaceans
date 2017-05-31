import * as d3 from 'd3'
import ScrollMagic from 'scrollmagic'
import loadData from './load-data-acquisitions'

const controller = new ScrollMagic.Controller({ refreshInterval: 0 })

let width = 0
let height = 0
let graphicW = 0
let graphicH = 0

let desktop = false
let enterExitScene = null
let timelineData = null

const margin = 40
const scaleX = d3.scaleBand()
const scaleY = d3.scaleLinear()

const formatYear = d3.timeFormat("%Y")
const parseYear = d3.timeParse("%Y")

const stepScenes = []


const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--scroll')
const graphicSel = containerSel.select('.scroll__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')
const proseSel = containerSel.select('.scroll__prose')
const stepSel = containerSel.selectAll('.prose__step')
const scrollSel = containerSel.select('.scroll')
const scrollVideoSel = containerSel.selectAll('.scroll__video')

let currentStep = '0'
let currentDirection = true

let currentVideoPlayer = null
let muted = true

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
			currentStep = step
			currentDirection = down
			updateChart({ step: step, down: down })
		})
		.on('leave', (event) => {
			const step = selection.attr('data-step')
			const down = event.scrollDirection === 'FORWARD'
			currentStep = step
			currentDirection = down
			// updateChart({ step: step, down: down })
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
			scrollVideoSel.classed('is-visible', true)
			currentVideoPlayer.play()
			const bottom = event.scrollDirection === 'REVERSE'
			if (bottom) graphicSel.classed('is-bottom', false)
				 console.log(graphicSel.classed('is-bottom'))
		})
		.on('leave', (event) => {
			graphicSel.classed('is-fixed', false)
			scrollVideoSel.classed('is-visible', false)
			currentVideoPlayer.pause()

			const bottom = event.scrollDirection === 'FORWARD'
			if (bottom) graphicSel.classed('is-bottom', true)
		})
		.addTo(controller)
}

function setupScroll() {
	stepSel.each(setupStep)
	setupEnterExit()
}


function getData(endYear, acquisition) {

	const filtered = timelineData.filter(d => d.year <= endYear)

	const stacked = d3.stack()
		.keys(['capture', 'born', 'rescue'])
		.order(d3.stackOrderNone)
		.offset(d3.stackOffsetNone)

	const stackFilter = stacked(filtered)

	// console.log(stackFilter[0])

	if (acquisition == 'capture') return [stackFilter[0]]
	else if (acquisition == 'bornCapture') return [stackFilter[0], stackFilter[1]]
	else if (acquisition == 'all') return stackFilter
}

	//const filtered = timelineData.filter(d => d.year <= endYear)

function translate(x, y) {	

	return `translate(${x}, ${y})`
}


function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 20000px)').matches

	// console.log(window.innerHeight)
}

function resizeScrollElements() {
	const factor = 0.9
	const h = Math.floor(height * factor)
	stepSel.style('padding-bottom', `${h}px`)

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
	// const proseW = proseSel.node().offsetWidth
	graphicW = width
	graphicH = graphicW / ratio

	graphicSel
		.style('height', `${height}px`)

	// const trim = graphicH - margin

	// graphicSel.select('svg')
	// 	.attr('width', graphicW)
	// 	.attr('height', trim)

		// console.log(graphicH)
		// console.log(graphicH-margin)
}

function setupDOM(){
	const svg = graphicContainerSel
		.append('svg')

	const gEnter = svg
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

function updateScales(data) {
	const trimW = graphicW - (margin * 2)
	const trimH = graphicH - (margin * 2)

	scaleX
		.rangeRound([0, trimW])
		.padding(0.1)
		//.domain(stackedData[0].map(d => d.data.year))
		.domain(timelineData.map(d => d.year))

	scaleY
		.range([trimH, 0])
		//.domain([0, d3.max(stackedData, d => d[0] + d[1])])
		//.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[0] + d[1])])
		//.domain([0, d3.max(stackedData[stackedData.length - 1], function(d) { return d[0] + d[1]; }) ])
		.domain([0, 178])
		//console.log(stackedData[stackedData.length-2])
}

function updateDom(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('g')

	g.attr('transform', translate(margin, margin))

	const plot = g.select('.timelinePlot')

	const layer = plot.selectAll('.layer')
		.data(data, d => d.key)

	const layerEnter = layer.enter().append('g')
		.attr('class', d => `layer layer--${d.key}`)

	layer.exit()
		.transition()
		.duration(500)
		.ease(d3.easeCubicInOut)
		.style('opacity', 0)
		.remove()

	const layerMerge = layerEnter.merge(layer)

	const bar = layerMerge.selectAll('.bar').data(d => d)

	// enter
	const barEnter = bar.enter().append('rect')
		.attr('class', 'bar')
		.attr('x', d => scaleX(d.data.year))
		.attr('y', d => scaleY(d[0]))
		.attr('width', scaleX.bandwidth())
		.attr('height', 0)

	// exit
	bar.exit().remove()

	// update

	const barMerge = barEnter.merge(bar)
	
	barMerge.transition()
		.delay(function(d, i){ return i * 50; })
		.duration(400)
		.attr('x', d => scaleX(d.data.year))
		.attr('y', d => scaleY(d[1]))
		.attr('width', scaleX.bandwidth())
		.attr('height', d => (scaleY(d[0]) - scaleY(d[1])))
}

function updateAxis(data) {
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

function updateVideo(step) {
	const videoSel = containerSel.select(`.scroll__video[data-step='${step}']`)
	const hasVideo = videoSel.size()


	if (currentVideoPlayer) currentVideoPlayer.pause()

	if (hasVideo) {
		videoSel.classed('is-visible', true)
		currentVideoPlayer = videoSel.select('video').node()
		currentVideoPlayer.play()
		currentVideoPlayer.muted = muted
	} else {
		scrollVideoSel.classed('is-visible', false)
	} 



	// make clickable
	graphicSel.classed('is-untouchable', hasVideo)
	proseSel.classed('is-untouchable', hasVideo)


}	

function updateChart({ step, down }) {
	let data = []
	if (step === ('0' || 'video--1')) data = getData(1938, "capture")
	if (step === 'data--1') data = getData(1962, "capture")
	if (step === 'data--2' || step === 'video--2') data = getData(1971, "capture")
	if (step === 'data--3'|| step === 'video--3') data = getData(1972, "capture")
	if (step === 'data--4'|| step === 'data--5' || step === 'video--4' || step === 'video--5' || step === 'video--6') data = getData(2017, "capture")
	if (step === 'data--6') data = getData(2017, "bornCapture")
	if (step === 'data--7' || step === 'video--7') data = getData(2017, "all")

	updateScales(data)
	updateAxis(data)
	updateDom(data)
	updateVideo(step)
}


function resize() {
	updateDimensions()
	resizeScrollElements()
	resizeGraphic()
	updateChart({ step: currentStep, down: currentDirection })
}

function setupEvents() {
	scrollVideoSel.on('click', () => {
		// if muted restart and unmute
		muted = !muted
		currentVideoPlayer.muted = muted
		if (!muted) currentVideoPlayer.currentTime = 0

	})
}

function setup(data) {
	setupDOM()
	resize()
	setupScroll()
	setupEvents()
}

function init() {
	loadData()
		.then((result) => {
			timelineData = result
			setup()
		})
		.catch(err => console.log(err))
}


export default { init, resize }