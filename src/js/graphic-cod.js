import * as d3 from 'd3'
import loadData from './load-data-cod'

const bodySel = d3.select('body') 
const containerSel = bodySel.select('.section--cod')
const graphicSel = containerSel.select('.cod__graphic')
const graphicContainerSel = graphicSel.select('.graphic__container')

let CODdata = []

function tabulate(data, columns) {
	const table = graphicContainerSel.append('table')
	const thead = table.append('thead')
	const tbody = table.append('tbody')

	// append the header row
	thead.append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	    .text(function (column) { return column; });

	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
	  .append('tr');

	// create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(function (row) {
	    return columns.map(function (column) {
	      return {column: column, value: row[column]};
	    });
	  })
	  .enter()
	  .append('td')
	    .text(function (d) { return d.value; });

  return table;
}



function setup() {
	tabulate(CODdata, ['Tank', 'COD', 'seaPen'])
	resize()
}

function resize() {

}


function init() {
	loadData()
		.then((result) => {
			CODdata = result
			setup()
		})
		.catch(err => console.log(err))
}

export default { init, resize }