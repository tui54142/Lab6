
(function () {
    //iife - this wraps the code in a function so it isn't accidentally exposed 
    //to other javascript in other files. It is not required.

    var width = 1300, height = 600

    //read in our csv file 
    d3.csv("./covid_cases_by_date.csv").then((data) => {

        console.log(data);

        data = data.filter((d) => { //keep only items that have a collection date
            return d.collection_date != "";
        });

        var parseTime = d3.timeParse("%Y-%m-%d");

        data.forEach(function (d) { //parse time and typecast count to numeric
            d.date = parseTime(d.collection_date)
            d.count = +d.count;
        });


        function sortByDateAscending(a, b) {
            return a.date - b.date;
        }

        data = data.sort(sortByDateAscending);

        //D3 Rollup
        var sumstat = d3.group(data, d => d.test_result);
        console.log(sumstat)

        //Create scales!
        var x = d3.scaleTime() //a scale to convert time to x-position
            .domain(d3.extent(data, function (d) { return d.date })) //min to max date
            .range([0, width]) //form 0 px to full width of page

        var y = d3.scaleLinear() //a scale to convert count to y-position
            .domain([0, d3.max(data, function (d) { return d.count; })])  //0 to max value
            .range([height, 0]) //from the bottom of the page to the top of the page

        var color = d3.scaleOrdinal()
            .domain(['negative', 'positive'])
            .range(['crimson', 'steelblue'])

        var line = d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(+d.count); })

        var svg = d3.select("#linegraph_covid")
            .append("g")
            .attr("transform", "translate(50, 50)");

        svg //add the linegraph
            .selectAll("path") //select all SVG paths in our canvas (i.e.: lines)
            .data(sumstat) //add our rolled up data
            .join("path") //join the data to path
            .attr('fill', 'white') // removes the area inside the path
            .attr('stroke', d => color(d[0])) //map color to the key (negative/positive)
            .attr("d", (d) => { //creates a stroke for each key/category rtnd by sumstat
                return line(d[1])
            });

        // Add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        // Add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

    });

})
    ();
