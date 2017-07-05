import 'promis'


function cleanDeath(d) {
	return {
		...d,
		birthYear : +d.BirthYear,
		count : +d.count
	}
}


function loadDeath(cb) {
	d3.csv('assets/birthYears.csv', cleanDeath, (err, data) => {
		cb (err, data)
	})
}

function init() {
	return new Promise((resolve, reject) => {
		loadDeath((err, data) => {
			if (err) reject('error loading data')
			else resolve(data)
		})
	})
}

export default init

