(function() {
  console.log("Test");

  function createGraph(graph) {
    var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

    var simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id(function(d) {
          return d.id;
        })
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter()
      .append("line");

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 2.5)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node.append("title").text(function(d) {
      return d.id;
    });

    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link").links(graph.links);

    function ticked() {
      link
        .attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

      node
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }

  const handleZipUpload = event => {
    const files = event.target.files;
    const formData = new FormData();
    formData.append("zip", files[0]);

    fetch("/upload_cache", {
      method: "POST",
      body: formData
    })
      .then(response => response.json())
      .then(json_path => {
        console.log("Successful upload. JSON Graph lives at: ", json_path);

        $.getJSON("/path/" + json_path, function(graph) {
          console.log(graph);
          createGraph(graph);
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  document.querySelector("#zip-file").addEventListener("change", event => {
    handleZipUpload(event);
  });
})();
