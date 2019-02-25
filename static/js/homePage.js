!function isAdmin() {
    let cookie = document.cookie;
    let cookieArr = cookie.split(";");
    for (let i in cookieArr) {
        let key = cookieArr[i].split("=")[0];
        key = key.trim();
        if (key === "is_superuser") {
            let isAdmin = cookieArr[i].split("=")[1].trim();
            var x = document.getElementById("admin");
            if (isAdmin === 'True') {
                $("#userStatus").text('Admin').css('margin-left', 15 + '%')
                x.style.display = "block";
            } else {
                $("#userStatus").text('Normal User')
                x.style.display = "none";

            }
        }
    }
}()

$.ajax({
    url: "/homepage/get/", // the endpoint
    type: "GET", // http method

    // handle a successful response
    success: function (response) {
        if (response == '') return
        var nodes = JSON.parse(response)
        let nodelist = []
        nodes.node.forEach(function (e) {
            const node = {
                id: e.id,
                number: e.number, //parseInt(e.number.substr(1), 10),
                type: e.type,
                status: e.status,
                pattern: e.pattern, //parseInt(e.pattern.substr(1), 10),
                // x: Math.cos(patterns[pattern].nodes.length / numPatterns * 2 * Math.PI) * 200 + 1200 / 2 + Math.random(),
                // y: Math.sin(patterns[pattern].nodes.length / numPatterns * 2 * Math.PI) * 200 + 800 / 2 + Math.random()
                x: Math.random(),
                y: Math.random()
            };
            nodelist.push(node)
        });
        draw(nodelist, nodes.link)
    },

    // handle a non-successful response
    error: function (xhr, errmsg, err) {
        $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
            " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
        console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
    }
});

$('#logout').on('click', function () {
    window.location.href = '/homepage/logout/'
})

this.canvas = d3.select('#canvas').append('svg:svg').attr('width', '1200').attr('height', '800');

this.vis = this.canvas.append('svg:g');

this.vis.append('svg:g').attr('class', 'linkContainer');
this.vis.append('svg:g').attr('class', 'nodeContainer');

this.forceLayout = d3.layout.force().size([1200, 800]).nodes([]).links([])
//.linkDistance(d => 100)
//     .charge(function (d) {
//         var charge = -500;
//         if (d.index === 0 || d.index % 7 == 0) charge = 10 * charge;
//         return charge;
//     }).on("tick", this._tick.bind(this));
    .charge(-5000)
    .on("tick", this._tick.bind(this));

document.querySelector('#btn_node').addEventListener('click', e => {
    var pattern = document.getElementById("pattern").value;
    if (patterns[pattern].nodes.length === 0) {
        // 0 is non-connector, 1 is connector
        this.addNode(1, pattern);
    } else {
        this.addNode(0, pattern);
    }
});

document.querySelector('#btn_link').addEventListener('click', e => {
    var pattern = document.getElementById("pattern").value;
    var source = document.getElementById("source").value;
    var target = document.getElementById("target").value;
    this.moveConnectorTo(pattern, source, target);
});

document.querySelector('#btn_delete').addEventListener('click', e => {
    var pattern = document.getElementById("pattern").value;
    var id = document.getElementById("delete").value;
    this.deleteNode(pattern, id);
});


var numNodes = 0;
var patterns = [];
var numPatterns = 4;
for (var i = 0; i < 4; i++) {
    var pattern = {};
    pattern['nodes'] = [];
    pattern['links'] = 0;
    patterns.push(pattern);
}

function addNode(type, pattern) {
    if (patterns[pattern].nodes.length === 7) return; //no more than 7 nodes
    let id = this._nextID()
    let number = 'N' + ("0" + this._nextID()).slice(-2);
    const node = {
        id: id,
        number: number,
        type: type,
        status: true,
        pattern: pattern,
        // x: Math.cos(patterns[pattern].nodes.length / numPatterns * 2 * Math.PI) * 200 + 1200 / 2 + Math.random(),
        // y: Math.sin(patterns[pattern].nodes.length / numPatterns * 2 * Math.PI) * 200 + 800 / 2 + Math.random()
        x: Math.random(),
        y: Math.random()
    };

    patterns[pattern].nodes.push(node);
    this.forceLayout.nodes().push(node);

    let nodes = patterns[pattern].nodes; //Nodes in current pattern
    let size = nodes.length; //Length of current pattern nodes
    if (nodes.length >= 1 && nodes.length < 3) {
        //link with connector
        this.addLink(nodes[0].id, nodes[size - 1].id); // connector index, index of last addition
        patterns[pattern].links++;
    } else if (size <= 4) {
        //close loop with connector
        this.addLink(nodes[0].id, nodes[size - 1].id); // connector index, index of last addition
        this.addLink(nodes[size - 1].id, nodes[size - 2].id);
    } else {
        //remove links between last node added, and first nonconnector node
        this.removeLinkBetween(nodes[size - 2].id, nodes[1].id);
        //close loop with new node and first non nonconnector connector
        this.addLink(nodes[size - 1].id, nodes[1].id);
        this.addLink(nodes[size - 1].id, nodes[size - 2].id);
    }


    let data = {
        'link': []
    }
    console.log(this.forceLayout.links())
    data.link = this.forceLayout.links()
    if (patterns[pattern].nodes.length === 1) {
        console.log('conn')
        // Adding a connector node
        data.link.push({
            'source': {'id': id, 'number': number, 'pattern': pattern, 'type': 1},
            'target': {'id': id, 'number': number, 'pattern': pattern, 'type': 1}
        })
    }
    $.ajax({
        url: "/homepage/addNode/", // the endpoint
        type: "POST", // http method
        data: JSON.stringify(data),

        // handle a successful response
        success: function (response) {
            // console.log(JSON.parse(response)) // log the returned json to the console
            console.log("success"); // another sanity check
            _redraw()

        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });


}

function addLink(s, l) {
    let source = -1, target = -1;
    const nodes = this.forceLayout.nodes();

    if (this._verifyNewLink(s, l)) {
        // source = s;
        // target = l;
        source = find(s)
        target = find(l)
    } else {
        console.error('unable to create link');
        return
    }

    this.forceLayout.links().push({
        source, target
    });

    this._redraw();
}

function moveConnectorTo(pattern, s, t) {
    let nodes = this.forceLayout.nodes();
    let source = -1, target = -1;

    if (!this._findLink(patterns[pattern].nodes[0].id, s)) {
        console.error('source is not linked with connector');
        return
    }

    //Remove old link from connector to source
    this.removeLinkBetween(nodes[s].id, patterns[pattern].nodes[0].id);

    //Check and add new link
    if (this._verifyNewLink(nodes[t].id, patterns[pattern].nodes[0].id)) {
        // source = patterns[pattern].nodes[0].id;
        // target = nodes[t].id;
        source = find(patterns[pattern].nodes[0].id)
        target = find(nodes[t].id)
    } else {
        console.error('unable to create link');
        return
    }


    this.forceLayout.links().push({
        source, target
    });

    this._redraw();
}

function _verifyNewLink(source, target) {
    return (
        source != target &&
        !this._findLink(source, target));
}

function removeLinks(_id) {
    let id = _id
    let links = this.forceLayout.links();
    let i = 0;
    while (i < links.length) {
        if ((links[i].source.id == id) || (links[i].target.id == id)) {
            links.splice(i, 1);
        }
        else
            i++;
    }
    this._redraw();
}

function removeLinkBetween(id1, id2) {
    let links = this.forceLayout.links();
    let i = 0;
    while (i < links.length) {
        if ((links[i].source.id === id1 && links[i].target.id === id2) ||
            (links[i].source.id === id2 && links[i].target.id === id1))
            this.forceLayout.links().splice(i, 1);
        else
            i++;
    }

    let data = {
        'node1': {id: id1},
        'node2': {id: id2}
    }
}

function _getConnectorLinks(id) {
    let i = 0, count = 0;
    while (i < links.length) {
        if (links[i].source.id === id || links[i].target.id === id)
            count++;
        else
            i++;
    }
    return count;
}

function deleteNode(pattern, _id) {
    let id = _id;
    if (patterns[pattern].nodes.length == 1) return;
    let nodes = this.forceLayout.nodes();
    let links = this.forceLayout.links();
    let i = 0;
    while (i < nodes.length) {
        if (nodes[i].id == id) {
            patterns[pattern].nodes.splice(i, 1);
            nodes.splice(i, 1);
        }
        else
            i++;
    }
    this.removeLinks(id);

}

function _tick() {
    this.vis.selectAll('.node').attr('transform', d => `translate(${d.x}, ${d.y})`);

    this.vis.selectAll(".link").attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
}

function _redraw() {
    this._updateNodes();
    this._updateLinks();
    this.forceLayout.start();
}

function draw(nodes, links) {
    nodes.forEach(function (e) {
        this.forceLayout.nodes().push(e)
        patterns[parseInt(e.pattern.substr(1), 10)].nodes.push(e)
    });
    links.forEach(function (e) {
        let source = find(e.source.id)
        let target = find(e.target.id)

        this.forceLayout.links().push({
            source, target
        });
    });
    this._redraw()
}


function _updateNodes(nodeList) {
    const nodes = nodeList == null ? this.forceLayout.nodes() : nodeList
    const sel = this.vis.select('.nodeContainer').selectAll('.node');
    const binding = sel.data(nodes, function (d) {
        return d.id
    }); //key that defines each item in the array. https://stackoverflow.com/questions/44891369/how-to-remove-node-in-d3-force-layout

    binding.enter().insert('g').attr('class', 'node').style('z-index', 1).call(sel => {
        sel.each(function (d) {
            const node = d3.select(this);
            node.append('circle').attr('r', 0).style('fill', d => d.type === 1 ? "blue" : "white")
                .transition().duration(750).ease('elastic').attr('r', 20);
            node.append('text')
                .text(node => "N" + node.id)
                .attr('font-size', 8)
                .attr('dx', -6)
                .attr('dy', 4)
            node.append('text')
                .text(node => node.type === 1 ? "" + node.pattern : '')
                .attr('font-size', 8)
                .attr('fill', 'black')
                .attr('dx', 25)
                .attr('dy', 4)
        });
    }).call(this.forceLayout.drag);

    binding.exit().remove();

    this.forceLayout.start();

}

function _updateLinks(linkList) {
    const layout_links = linkList == null ? this.forceLayout.links() : linkList
    const links = this.vis.select('.linkContainer').selectAll(".link").data(layout_links);
    links.enter().insert('line').attr('class', 'link').style('stroke', 'white').style('stroke-width', 5)
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    links.exit().remove();

    this.forceLayout.start();
}

function _findNodeByID(id) {
    return this.forceLayout.nodes().filter(d => d.id == id)[0];
}

function _findLink(source, target) {
    return this.forceLayout.links().filter(d =>
        d.source.id == source && d.target.id == target)[0];
}

function _nextID() {
    let id = 1;
    while (this._findNodeByID(id)) {
        id++;
    }
    return id;
}

//find the node index
function find(f) {
    var i = -1
    this.forceLayout.nodes().forEach(function (node, index) {
        if (node.id == f)
            i = index;
    });
    return i;
}







