import debounce from 'lodash.debounce'
import { select, addClass } from './utils/dom'
import isMobile from './utils/is-mobile'
import graphicAcquisitions from './graphic-acquisitions'
import graphicOrcaDeath from './graphic-orca-death'
import graphicDeath from './graphic-death'
import graphicLifespan from './graphic-lifespan'

const bodyEl = select('body')
let previousWidth = 0
let desktop = false

function intro() {
	desktop = window.matchMedia('(min-width: 600px)').matches
	const h = desktop ? `${window.innerHeight * 0.85}px` : 'auto'
	d3.select('.intro').style('height', h)
}

function handleResize() {
	const width = bodyEl.offsetWidth
	if (previousWidth !== width) {
		intro()
		previousWidth = width
		graphicAcquisitions.resize()
/*		graphicLifespan.resize()*/
		graphicOrcaDeath.resize()
		graphicDeath.resize()
	}
}

function init() {
	intro()
	// add mobile class to body tag
	if (isMobile.any()) addClass(bodyEl, 'is-mobile')
	// setup resize event
	window.addEventListener('resize', debounce(handleResize, 150))
	// kick off graphic code
	graphicAcquisitions.init()
/*	graphicLifespan.init()*/
	graphicOrcaDeath.init()
	graphicDeath.init()
}

init()
