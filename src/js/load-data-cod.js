import * as d3 from 'd3'
import 'promis'


function cleanCOD(d) {
	return {
		...d,
		birthYear : +d.BirthYear,
		count : +d.count
	}
}


function loadCOD(cb) {
	d3.csv('assets/causeOfDeath.csv', cleanCOD, (err, data) => {
		cb (err, data)
	})
}

function init() {
	return new Promise((resolve, reject) => {
		loadCOD((err, data) => {
			if (err) reject('error loading data')
			else resolve(data)
		})
	})
}

export default init