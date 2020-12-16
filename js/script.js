const config = {
	topojsonUrl : "https://raw.githubusercontent.com/azharisikumbang/sumbar-map-example/main/js/topo-sumbar.json",
	style: {
		width: 960,
		height: 620,
		color: {
			one: "#fee0d2",
			two: "#fc9272",
			three: "#de2d26",
		},
		stroke: {
			width : "0.4",
			value : "white"
		}
	}

}

let cachedElement;

async function request(url){
    const response = await fetch(url, {
    	ignoreCache: false
    });
    const json = await response.json()
    return await json;
}

async function renderElement() {
	request(config.topojsonUrl)
		.then(async topojsonResponse => {

			const dataContainerEl = document.createElement("div");
			dataContainerEl.classList.add("data-container");

			const dataListContainerEl = document.createElement("div");
			dataListContainerEl.setAttribute("id", "data-list-container");

			dataContainerEl.append(dataListContainerEl)

			const dataContainerTitleEl = document.createElement("h4");
			dataContainerTitleEl.innerHTML = "Sebaran Mahasiswa Di Sumatera Barat";
			dataContainerEl.prepend(dataContainerTitleEl);

			await topojsonResponse.objects["sumatera-barat"].geometries
				.sort((a, b) => (a.properties.kabkot > b.properties.kabkot) - (a.properties.kabkot < b.properties.kabkot))
				.map((city, index) => {
					city.properties["sample"] = Math.floor(Math.random() * Math.floor(1000));

					if (city.properties.kabkot.toUpperCase() != "DANAU") {
						dataListContainerEl.append(createDataList((index + 1), city.properties));
					}
				});

			const divEl = document.createElement("div")

			const svg = d3.select("#app").append("svg")
	            .attr("width", config.style.width)
	            .attr("height", config.style.height)

	        const projection = d3.geoMercator()
	            .center([100, -1.2])
	            .scale(config.style.width * 7)
	            .translate([config.style.width / 2, config.style.height / 2])

	        const path = d3.geoPath().projection(projection)

	        svg.append("rect")
	            .attr("class", "rect")
	            .attr("width", config.style.width)
	            .attr("height", config.style.height)

	        const g = svg.append("g")

	        g.append("g")
	            .attr("id", "subunits")
	            .selectAll("path")
	            .data(topojson.feature(topojsonResponse, topojsonResponse.objects['sumatera-barat']).features)
	            .enter()
	            .append("path")
	            .attr("d", path)
	            .attr("stroke", config.style.stroke.value)
	            .attr("stroke-width", config.style.stroke.width)
	            .attr("fill", d => {
	            	if(d.properties.kabkot.toUpperCase() == "DANAU") {
	            		return "white";
	            	} else if (d.properties.sample < 100) {
	            		return config.style.color.one;
	            	} else if (d.properties.sample < 500) {
	            		return config.style.color.two;
	            	} else {
	            		return config.style.color.three;
	            	}
	            })
	            .on("mouseover", showToolTip)
	            .on("mouseout", hideToolTip)

	         g.append("path")
	            .datum(topojson.mesh(topojsonResponse, topojsonResponse.objects['sumatera-barat'], (a, b) => a !== b))
	            .attr("id", "state-borders")
	            .attr("d", path)

	         divEl.append(svg._groups[0][0]);

	         divEl.append(createDataIndicator());
	         
	         app.append(divEl);
	         app.append(dataContainerEl);

	         cachedElement = dataListContainerEl.outerHTML; 

		})
}

function createDataList(index, properties) {
	let li;

	li = document.createElement("li");
	li.style.listStyleType = "none";
	li.style.marginBottom = "10px";
	li.innerHTML = properties.kabkot + " : " + properties.sample + " mahasiswa";

	return li;
}

function showToolTip(){

	this.attributes.stroke.value = "black";
	this.attributes.stroke.width = config.style.stroke.width + 5;

	const detailNodeShow = ["Wilayah", "Sample Data"];

	const dataListContainer = document.getElementById("data-list-container");

	const ul = document.createElement("ul");
	ul.style.listStyleType = "none";
	ul.style.paddingLeft = 0;

	let li, detailTextWrapper, detailText;

	detailNodeShow.map((el, index) => {
		li = document.createElement("li");
		li.style.marginBottom = "10px";

		detailText = (index) ? this.__data__.properties.sample : this.__data__.properties.kabkot;

		detailTextWrapper = document.createTextNode(el + " : " + detailText);

		li.append(detailTextWrapper);

		ul.append(li);
	});


	dataListContainer.innerHTML = ul.outerHTML;
}

function hideToolTip(){
	document.getElementById("data-list-container").innerHTML = cachedElement;

	this.attributes.stroke.value = config.style.stroke.value;
	this.attributes.stroke.width = config.style.stroke.width;
}

function createDataIndicator() {
	const statusText = [" < 100", "100 - 500", " > 500"];

	const dataIndocatorEl = document.createElement("div");
	dataIndocatorEl.style.display = "flex";
	dataIndocatorEl.style.justifyContent = "space-between";
	dataIndocatorEl.style.padding = "0px 100px";

	let indicatorText, indicatorBox, indicator;	
	
	statusText.map(el => {

		switch(el) {
			case " < 100":
				indicatorColor = config.style.color.one;
				break;

			case "100 - 500":
				indicatorColor = config.style.color.two;
				break;

			case " > 500":
				indicatorColor = config.style.color.three;
				break;
		}

		indicator = document.createElement("div");

		indicatorBox = document.createElement("span");
		indicatorBox.style.display = "inline-block";
		indicatorBox.style.width = "12px";
		indicatorBox.style.height = "12px";
		indicatorBox.style.marginRight = "10px";
		indicatorBox.style.backgroundColor = indicatorColor;

		indicatorText = document.createTextNode(el);

		indicator.append(indicatorBox);
		indicator.append(indicatorText);

		dataIndocatorEl.append(indicator);
	});

	return dataIndocatorEl;
}


document.addEventListener('DOMContentLoaded', function() {
	const app = document.getElementById("app");

	renderElement();
});
