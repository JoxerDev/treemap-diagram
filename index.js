const DATASET_URL =
  "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

d3.json(DATASET_URL, function (error, data) {
  if (error) throw error;

  let width = 960;
  let height = 570;

  let tooltip = d3
    .select("#chart")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  let colorFade = function (color) {
      return d3.interpolateRgb(color, "#fff")(0.1);
    },
    color = d3.scaleOrdinal(d3.schemeCategory20.map(colorFade)),
    format = d3.format(",d");

  // Treemap & hierarchy build
  let treemap = d3.treemap().size([width, height]).paddingInner(1.5);

  let root = d3
    .hierarchy(data)
    .eachBefore(function (d) {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum(sumBySize)
    .sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });

  treemap(root);

  // SVG
  let svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let cell = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "group")
    .attr("transform", function (d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    });

  cell
    .append("rect")
    .attr("id", (d) => d.data.id)
    .attr("class", "tile")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("data-name", (d) => d.data.name)
    .attr("fill", (d) => color(d.data.category))
    .on("mousemove", function (d) {
      d3.select(this).attr("border", 2).attr("stroke", "black");
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          "Name: " +
            d.data.name +
            "<br>Category: " +
            d.data.category +
            "<br>Value: " +
            d.data.value
        )
        .attr("data-value", d.data.value)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("border", "").attr("stroke", "");
      tooltip.style("opacity", 0);
    });

  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data(function (d) {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", function (d, i) {
      return 13 + i * 10;
    })
    .text(function (d) {
      return d;
    });

  let categories = root.leaves().map((d) => d.data.category);
  categories = categories.filter((category, index, self) => (self.indexOf(category) === index))
  
  // Legend
  const LegendRectSize = 20;
  const LegendHorizontalSpacing = 140;
  const LegendVerticalSpacing = 7;
  let legendElemsPerRow = 4;
  
  let legend = d3.select("#legend")
    .append("g")
    .attr("width", "500")
    .attr("transform", "translate(0, 15)")
    .selectAll("g")
    .data(categories)
    .enter().append("g")
    .attr("transform", function(d, i) { 
      return 'translate(' + 
      ((i%legendElemsPerRow)*LegendHorizontalSpacing) + ',' + 
      ((Math.floor(i/legendElemsPerRow))*LegendRectSize + (LegendVerticalSpacing*(Math.floor(i/legendElemsPerRow)))) + ')';
    })
     
  legend.append("rect")                              
     .attr('width', LegendRectSize)                          
     .attr('height', LegendRectSize)     
     .attr('class','legend-item')                 
     .attr('fill', (d) => color(d))
     
   legend.append("text")                              
     .attr('x', 25)                          
     .attr('y', 15)                       
     .text((d) => d);  
});

function sumBySize(d) {
  return d.value;
}
