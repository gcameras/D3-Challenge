// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

// Function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
            d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, chartWidth]);

    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
            d3.max(censusData, d => d[chosenYAxis]) * 1.2
        ])
        .range([chartHeight, 0]);

    return yLinearScale;
}

// Function used for updating x-axis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating y-axis var upon click on axis label
function renderAxes_y(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function used for abbr labels when updating x-axis
function renderAbbr(abbrGroup, xLinearScale, chosenXAxis) {
    abbrGroup.transition()
        .duration(1000)
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .text(d => d.abbr)
    return abbrGroup
}

// Function used for abbr labels when updating y-axis
function renderAbbr_y(abbrGroup, yLinearScale, chosenYAxis) {
    abbrGroup.transition()
        .duration(1000)
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
    return abbrGroup
}

// Retrieve data from the DATA.CSV file and execute everything below
(async function() {
    var censusData = await d3.csv("assets/data/data.csv").catch(function(error) {
        console.log(error);
    });

    // Parse Data/Cast as numbers
    censusData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // X and Y LinearScales from csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append y-axis
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0,${chartHeight})`)
        .call(bottomAxis)

    // Append y-axis
    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis)

    // Create nodes
    var node = chartGroup.selectAll('.nodes')
        .data(censusData)
        .enter().append('g')
        .attr('class', 'nodes')

    // Append initial circles   
    var circlesGroup = node.append('circle')
        .attr("r", "15")
        .attr("fill", "darkcyan")
        .attr("opacity", "0.5")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))

    // Circle abbreviations   
    var abbrGroup = node.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]) - 0.2)
        .attr('text-anchor', 'middle')
        .attr('fill', "white")
        .text(d => d.abbr)
        .classed('abbr', true);

    // Create group for x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    // Set poverty label   
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty(%)");

    // Set age label   
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Age(Median)");

    // Set household label  
    var householdLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Household Income(Median)");

    // Create group for y axis lables
    var ylabelGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // Set health label  
    var healthlabel = ylabelGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthecare(%)");

    // Set smokes label
    var smokeslabel = ylabelGroup.append("text")
        .attr("y", 0 - (margin.left - 20))
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smokes(%)");

    // Set obese label
    var obeselabel = ylabelGroup.append("text")
        .attr("y", 0 - (margin.left - 40))
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese(%)");

    // Labels event listener for y-axis
    ylabelGroup.selectAll('text')
        .on('click', function() {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value !== chosenYAxis) {
                // replaces chosenYAxis with value
                chosenYAxis = value;
                // updates y scale for new data
                yLinearScale = yScale(censusData, chosenYAxis);
                // updates y axis with transition
                yAxis = renderAxes_y(yLinearScale, yAxis);
                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // updates the abbr within circles
                abbrGroup = renderAbbr_y(abbrGroup, yLinearScale, chosenYAxis);
                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthlabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeslabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeselabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                    smokeslabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthlabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeselabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    obeselabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthlabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeslabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        })

    // Labels event listener for x-axis
    xlabelsGroup.selectAll('text')
        .on('click', function() {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);
                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // updates the abbr within circles
                abbrGroup = renderAbbr_x(abbrGroup, xLinearScale, chosenXAxis);
                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    householdLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

            }
        })

})();