import 'promis'


function cleanLifespan(d) {
	return {
		...d,
		age : +d.Age,
		count : +d.count,
		animals: d.animals,
		status: d.status,
	}
}


function loadLifespan(cb) {
	d3.csv('assets/lifespan.csv', cleanLifespan, (err, data) => {
		cb (err, data)
	})
}

function init() {
	return new Promise((resolve, reject) => {
		loadLifespan((err, data) => {
			if (err) reject('error loading data')
			else resolve(data)
		})
	})
}

export default init