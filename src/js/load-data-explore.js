import * as d3 from 'd3'
import 'promis'

const parseDate = d3.timeParse("%Y-%m-%d")

function cleanExplore(d) {
	return {
		...d,
		acqYear: +d.AcqYear,
		birthYear: +d.BirthYear,
		originDate: parseDate(d.OriginDateFormat),
		deathDate: parseDate(d.StatusDateFormat),

	}
}


function loadExplore(cb) {
	d3.csv('assets/allCetaceans.csv', cleanExplore, (err, data) => {
		cb (err, data)
	})
}

function init() {
	return new Promise((resolve, reject) => {
		loadExplore((err, data) => {
			if (err) reject('error loading data')
			else resolve(data)
		})
		// d3.queue()
		// 	.defer(loadAcquisitions)
		// 	.awaitAll((err, result) => {
		// 		if (err) reject(err)
		// 		else resolve(result)
		// 	})
	})
}

export default init
