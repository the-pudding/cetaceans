import * as d3 from 'd3'
import 'promis'

function cleanCetaceans(d) {
	return {
		...d,
		species : d.Species,
		acquisition : d.Acquisition,
		year : +d.AcqYear
	}
}


function loadCetaceans(cb) {
	d3.csv('assets/allCetaceans.csv', cleanCetaceans, (err, data) => {
		cb (err, data)
	})
}

function init() {
	return new Promise((resolve, reject) => {
		d3.queue()
			.defer(loadCetaceans)
			.awaitAll((err, result) => {
				if (err) reject(err)
				else resolve(result)
			})
	})
}

export default init
