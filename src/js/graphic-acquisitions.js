import ScrollMagic from 'scrollmagic'
import loadData from './load-data-acquisitions'
import * as svgAnnotation from 'd3-svg-annotation'

const videoData = [
	{ id: 'marineland', step: 0, year: '1940', w: 440, h: 330, align: 'left', y: 30 },
	{ id: 'flipper', step: 2, year: '1963', w: 480, h: 270, align: 'center', y: 70 },
	{ id: 'hitchhikers', step: 4, year: '1978', w: 440, h: 300, align: 'center', y: 90 },
	{ id: 'dolphintale', step: 6, year: '2011', w: 480, h: 260, align: 'right', y: 90 },
]

const annotationData = [
{
	event: 'MarinePark',
	description: 'First marine park opened',
	year: 1938,
	height: 0,
	dx: 0,
	dy: 100,
}
]

const controller = new ScrollMagic.Controller({ refreshInterval: 0 })

const FONT_SIZE = 12

let width = 0
let height = 0
let graphicW = 0
let graphicH = 0

let desktop = false
let enterExitScene = null
let timelineData = null

const margin = { top: 0, left: 50, bottom: 20, right: 20 }
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
const audioSel = containerSel.selectAll('.video__ui')

let currentStep = 'video--0'
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
			// if (step === 'video--0' && !down) updateChart({ step: 'data--99', down: false })
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
			proseSel.classed('is-fixed', true)
			const bottom = event.scrollDirection === 'REVERSE'
			if (bottom) graphicSel.classed('is-bottom', false)
		})
		.on('leave', (event) => {
			graphicSel.classed('is-fixed', false)
			proseSel.classed('is-fixed', false)
			scrollVideoSel.classed('is-visible', false)
			pauseVideo()
			const bottom = event.scrollDirection === 'FORWARD'
			if (bottom) graphicSel.classed('is-bottom', true)
		})
		.addTo(controller)
}

function setupScroll() {
	stepSel.each(setupStep)
	setupEnterExit()
}

function pauseVideo() {
	if (currentVideoPlayer) {
		const vid = currentVideoPlayer.node()
		if (vid.currentTime) vid.pause()
	}
}

function getData(endYear, acquisition) {

	const filtered = timelineData.filter(d => d.year <= endYear)

	const stacked = d3.stack()
		.keys(['capture', 'born', 'rescue'])
		.order(d3.stackOrderNone)
		.offset(d3.stackOffsetNone)

	const stackFilter = stacked(filtered)

	if (acquisition == 'capture') return [stackFilter[0]]
	else if (acquisition == 'bornCapture') return [stackFilter[0], stackFilter[1]]
	else if (acquisition == 'all') return stackFilter
}

function translate(x, y) {	

	return `translate(${x}, ${y})`
}


function updateDimensions() {
	width = graphicContainerSel.node().offsetWidth
	height = window.innerHeight
	desktop = window.matchMedia('(min-width: 600px)').matches
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
	const ratio = desktop ? 1.5 : 1
	graphicW = width
	// graphicH = graphicW / ratio
	graphicH = height * 0.65

	graphicSel
		.style('height', `${height}px`)
}

function resizeVideo() {
	const videoW = desktop ? Math.max(280, Math.floor(graphicW * 0.3)) : 280
	const bandwidth = scaleX.bandwidth()
	scrollVideoSel
		.style('left', d => {
			const xS = desktop ? scaleX(d.year) : scaleX(1973)
			const x = margin.left + (xS - videoW / 2) + bandwidth / 2

			if (!desktop) return `${x}px`
			else if (d.align === 'left') return `${x + videoW / 2}px`
			else if (d.align === 'right') return `${x - videoW / 2}px`
			return `${x}px`
		})
		.style('bottom', d => {
			const h = videoW / (d.w / d.h)
			const y = graphicH - scaleY(d.y) + 6
			return `${y}px`
		})

	scrollVideoSel.select('video, img')
		.style('width', `${videoW}px`)
		.style('height', d => `${videoW / (d.w / d.h)}px`)

	scrollVideoSel.select('.video__line')
		.style('height', d => {
			const videoH = videoW / (d.w / d.h)
			const y = graphicH - scaleY(d.y) - margin.bottom
			return `${y}px`
		})
}

function setupDOM() {
	const svg = graphicContainerSel.select('svg')

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

	y.append('text')
		.attr('class', 'label')
		.attr('transform', 'rotate(-90)')
		.attr('text-anchor', 'middle')
		.text('Number of acquired cetaceans')
}

function updateScales(data) {
	const trimW = graphicW - (margin.left + margin.right)
	const trimH = graphicH - (margin.top + margin.bottom)

	scaleX
		.rangeRound([0, trimW])
		.padding(0.1)
		.domain(timelineData.map(d => d.year))

	scaleY
		.range([trimH, 0])
		.domain([0, 210])
}

function updateDom(data) {
	const svg = graphicSel.select('svg')

	svg
		.attr('width', graphicW)
		.attr('height', graphicH)

	const g = svg.select('g')

	g.attr('transform', translate(margin.left, margin.top))

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
		.tickSize(-graphicW + margin.left + margin.right)

	const values = desktop ? ["1940", "1950", "1960", "1970", "1980", "1990", "2000", "2010"] : ["1940", "1960", "1980", "2000"]
	const axisBottom = d3.axisBottom(scaleX).tickValues(values).tickSize(0).tickPadding(FONT_SIZE / 1.5)

	const x = axis.select('.axis--x')
	const y = axis.select('.axis--y')

	const trim = graphicH - margin.bottom - margin.top

	x
		.attr('transform', `translate(0, ${trim})`)
		.call(axisBottom)

	y
		.call(axisLeft)

	y.select('text')
		.attr('y', -margin.left + FONT_SIZE)
		.attr('x', -graphicH / 2)
}

function updateVideo(step) {
	const videoSel = containerSel.select(`.scroll__video[data-step='${step}']`)
	const hasVideo = !!videoSel.size()
	pauseVideo()

	if (hasVideo) {
		videoSel.classed('is-visible', true)
		currentVideoPlayer = videoSel.select('video')
		currentVideoPlayer.node().play()
		currentVideoPlayer.node().muted = muted
		currentVideoPlayer.classed('unmuted', !muted)
	} else {
		scrollVideoSel.classed('is-visible', false)
	}

	// make clickable
	scrollSel.classed('is-untouchable', hasVideo)
}

function updateChart({ step, down }) {
	const stepNumber = step.split('--')[1]
	let data = []
	if (stepNumber === '0') data = getData(1938, "capture")
	if (stepNumber === '1') data = getData(1962, "capture")
	if (stepNumber === '2') data = getData(1971, "capture")
	if (stepNumber === '3') data = getData(1972, "capture")
	if (stepNumber === '4') data = getData(2017, "capture")
	if (stepNumber === '5') data = getData(2017, "capture")
	if (stepNumber === '6') data = getData(2017, "bornCapture")
	if (stepNumber === '7') data = getData(2017, "all")

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
	resizeVideo()
}

function setupEvents() {
	scrollVideoSel.select('video').on('click', () => {
		// if muted restart and unmute
		muted = !muted
		audioSel.classed('is-muted', muted)
		if (currentVideoPlayer) {
			currentVideoPlayer.node().muted = muted
			currentVideoPlayer.classed('unmuted', !muted)
		}
		if (currentVideoPlayer && !muted) currentVideoPlayer.node().currentTime = 0
	})
}

function setupVideo() {
	scrollVideoSel.data(videoData)

	scrollVideoSel.append('div')
		.attr('class', d => `video__line ${d.align}`)
}

function scrollAnnotations(){

	const type = svgAnnotation.annotationCustomType(
	  svgAnnotation.annotationCallout, 
	  {"className":"custom",
	    "note":{"lineType":"horizontal",
	    "align":"middle"}})

	const bandwidth = scaleX.bandwidth() / 2

	const annotations = [
	{
	  note: { label: 'Last Pacific White-Sided Dolphin Capture'},
	  data: { AcqYear: 1993, Capture: 0 },
	  dy: - graphicH / 3,
	  dx: 0
	},	{
	  note: { label: 'Last Beluga Capture'},
	  data: { AcqYear: 1992, Capture: 0 },
	  dy: - graphicH / 2,
	  dx: 0
	}, {
	  note: { label: 'Last Orca Capture'},
	  data: { AcqYear: 1978, Capture: 0 },
	  dy: - graphicH * 3 / 5,
	  dx: 0
	}, {
	  note: { label: 'Last Bottlenose Dolphin Capture'},
	  data: { AcqYear: 1986, Capture: 0 },
	  dy: - graphicH *4 / 5,
	  dx: 0
	}]

	//Skipping setting domains for sake of example

	const makeAnnotations = svgAnnotation.annotation()
	  .type(type)
	  .notePadding(10)
	  .textWrap(100)
	  //accessors & accessorsInverse not needed
	  //if using x, y in annotations JSON
	  .accessors({
	    x: d => scaleX(d.AcqYear) + (scaleX.bandwidth() / 2),
	    y: d => scaleY(d.Capture)
	  })
	  .accessorsInverse({
	     date: d => scaleX.invert(d.x),
	     close: d => scaleY.invert(d.y)
	  })
	  .annotations(annotations)

	  const svg = graphicContainerSel.select('svg')

	svg.select('.plotG')
	  .append("g")
	  .attr("class", "annotation-group")
	  .call(makeAnnotations)

}

function setup() {
	setupDOM()
	setupVideo()
	setupEvents()
	resize()
	setupScroll()
	// hack for safari
	setTimeout(resizeScrollElements, 1000)
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
