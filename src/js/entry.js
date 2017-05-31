import debounce from 'lodash.debounce'
import { select, addClass } from './utils/dom'
import isMobile from './utils/is-mobile'
import graphicAcquisitions from './graphic-acquisitions'
import graphicExplore from './graphic-explore'
import graphicDeath from './graphic-death'

const bodyEl = select('body')
let previousWidth = 0

function handleResize() {
	const width = bodyEl.offsetWidth
	if (previousWidth !== width) {
		previousWidth = width
		graphicAcquisitions.resize()
		// graphicExplore.resize()
	}
}

function init() {
	// add mobile class to body tag
	if (isMobile.any()) addClass(bodyEl, 'is-mobile')
	// setup resize event
	window.addEventListener('resize', debounce(handleResize, 150))
	// kick off graphic code
	graphicAcquisitions.init()
	// graphicExplore.init()
	// graphicDeath.init()
}

init()
