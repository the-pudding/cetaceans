import * as d3 from 'd3'
import loadData from './load-data-explore'

let tkData = []

function setup() {

}

function resize() {
	console.log('resize')
}


function init() {
	loadData()
		.then((result) => {
			tkData = result
			setup()
		})
		.catch(err => console.log(err))
}

export default { init, resize }
