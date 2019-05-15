

// var init = function(){
//   d3.csv("data.csv", function(error, data) {
//     if (error) throw error;
//     buildChart(data)
//   }
// }
// set the dimensions and margins of the graph
var margin = {top: 20, right: 40, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var yLeft = d3.scaleLinear()
          .range([height, 0]);

var yRight = d3.scaleLinear()
          .range([height, 0]);
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");




// get the data
d3.csv("data.csv", function(error, data) {
  if (error) throw error;

  // format the data
  data.forEach(function(d) {
    d.Left = +d.Left;
    d.Right = +d.Right;
    d.category = +d.category;
  });

  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.category; }));
  yLeft.domain([0 , d3.max(data, function(d) { return d.Left; })]);
  yRight.domain([0 , d3.max(data, function(d) { return d.Right; })]);

  // append the rectangles for the bar chart
  var barLeft = svg.selectAll(".barLeft")
      .data(data)
    .enter().append("rect")
      .attr("class", function(d,i){
        return "barLeft b" + i
      })
      .attr("x", function(d) { return x(d.category) ; })
      .attr("width", x.bandwidth()*.5)
      .attr("y", function(d) { return yLeft(d.Left); })
      .attr("height", function(d) { return height - yLeft(d.Left); });

  var barRight= svg.selectAll(".barRight")
      .data(data)
    .enter().append("rect")
      .attr("class", function(d,i){
        return "barRight b" + i
      })
      .attr("x", function(d) { return x(d.category) + x.bandwidth()*.5 ; })
      .attr("width", x.bandwidth()*.5)
      .attr("y", function(d) { return yRight(d.Right); })
      .attr("height", function(d) { return height - yRight(d.Right); });


  barLeft.each(function(b,i){
    // console.log(b,data[i])
    svg.append("line")
      .attr("class", "lineLeft l" + i)
      .attr("x1", x(data[i].category) + x.bandwidth() * .5)
      .attr("x2", function(){
        return (i < data.length-1) ? x(data[i + 1].category) + x.bandwidth() * .5 : x(data[i].category) + x.bandwidth() * .5
      })
      .attr("y1", yLeft(data[i].Left))
      .attr("y2", function(){
        return (i < data.length-1) ? yLeft(data[i + 1].Left) : yLeft(data[i].Left)
      })
  })

  barRight.each(function(b,i){
    // console.log(b,data[i])
    svg.append("line")
      .attr("class", "lineRight l" + i)
      .attr("x1", x(data[i].category) + x.bandwidth() * .5)
      .attr("x2", function(){
        return (i < data.length-1) ? x(data[i + 1].category) + x.bandwidth() * .5 : x(data[i].category) + x.bandwidth() * .5
      })
      .attr("y1", yRight(data[i].Right))
      .attr("y2", function(){
        return (i < data.length-1) ? yRight(data[i + 1].Right) : yRight(data[i].Right)
      })
  })

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
      .attr("class", "axis Left")
      .call(d3.axisLeft(yLeft));

  // add the y Axis
  svg.append("g")
      .attr("class", "axis Right")
      .call(d3.axisRight(yRight))
      .attr("transform", "translate(" + width + ",0)");

});


function updateY(side, min, max){
  d3.select(".inputRow.max" + side + " span").html(d3.format(".0f")(max))
  d3.select(".inputRow.min" + side + " span").html(d3.format(".0f")(min))

  var scale = d3.scaleLinear()
          .range([height, 0]);
  var data = d3.selectAll(".bar" + side).data()
  scale.domain([min, max])
  
  var bar = d3.selectAll(".bar" +  side)
      .transition()
      .attr("y", function(d) { return scale(d[side]); })
      .attr("height", function(d) { return height - scale(d[side]); });


  bar.each(function(b,i){
    d3.select(".line" + side +".l" + i)
      .transition()
      .attr("y1", scale(data[i][side]))
      .attr("y2", function(){
        return (i < data.length-1) ? scale(data[i + 1][side]) : scale(data[i][side])
      })
  })

  if(side == "Left"){
    d3.select(".axis.Left")
      .transition()
      .call(d3.axisLeft(scale));
  }else{
    d3.select(".axis.Right")
      .transition()
      .call(d3.axisRight(scale));
  }

}

function getYVal(side, extreme){
  return +d3.select("#" + extreme + side).node().value
}

function showSeries(side, type){
  if(type == "bar"){
    d3.selectAll(".line" + side).transition().style("opacity",0)
    d3.selectAll(".bar" + side).transition().style("opacity",1)  
  }
  else if(type == "line"){
    d3.selectAll(".line" + side).transition().style("opacity",1)
    d3.selectAll(".bar" + side).transition().style("opacity",0)      
  }
  else if(type == "none"){
    d3.selectAll(".line" + side).transition().style("opacity",0)
    d3.selectAll(".bar" + side).transition().style("opacity",0)  
  }
  
}

d3.selectAll(".button").on("click", function(){
  var side = (d3.select(this).classed("Left")) ? "Left" : "Right"
  var type;
  if(d3.select(this).classed("bar")) type = "bar";
  if(d3.select(this).classed("line")) type = "line";
  if(d3.select(this).classed("none")) type = "none";

  d3.selectAll(".button." + side).classed("active", false)
  d3.select(this).classed("active", true)

  showSeries(side, type)

})

d3.select("#maxLeft").on("input", function(){
  if(getYVal("Left", "max") <= getYVal("Left", "min")){
    this.value = getYVal("Left", "min") + 1
  }else{
    updateY("Left", getYVal("Left", "min"), this.value)
  }
})

d3.select("#minLeft").on("input", function(){
  if(getYVal("Left", "max") <= getYVal("Left", "min")){
    this.value = getYVal("Left", "max") - 1
  }else{
    updateY("Left", this.value, getYVal("Left", "max"))
  }
})

d3.select("#maxRight").on("input", function(){
  if(getYVal("Right", "max") <= getYVal("Right", "min")){
    this.value = getYVal("Right", "min") + 1
  }else{
    updateY("Right", getYVal("Right", "min"), this.value)
  }
})

d3.select("#minRight").on("input", function(){
  if(getYVal("Right", "max") <= getYVal("Right", "min")){
    this.value = getYVal("Right", "max") - 1
  }else{
    updateY("Right", this.value, getYVal("Right", "max"))
  }
})