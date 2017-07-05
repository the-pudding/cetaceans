import 'promis'


function cleanOrcaDeath(d) {
	return {
		...d,
		birthYear : +d.BirthYear,
		count : +d.count
	}
}


function loadOrcaDeath(cb) {
	d3.csv('assets/orcaDeaths.csv', cleanOrcaDeath, (err, data) => {
		cb (err, data)
	})
}

function init() {
	return new Promise((resolve, reject) => {
		loadOrcaDeath((err, data) => {
			if (err) reject('error loading data')
			else resolve(data)
		})
	})
}

export default init
