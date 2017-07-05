import 'promis'

function cleanAcquisitions(d) {
	return {
		...d,
		year : +d.AcqYear,
		born : +d.Born,
		capture : +d.Capture,
		rescue : +d.Rescue,
		total : +d.Total,
	}
}


function loadAcquisitions(cb) {
	d3.csv('assets/acquisitionsOnly2.csv', cleanAcquisitions, (err, data) => {
		cb (err, data)
	})
}

function init() {
	return new Promise((resolve, reject) => {
		loadAcquisitions((err, data) => {
			if (err) reject('error loading data')
			else resolve(data)
		})
	})
}

export default init
