/* Functions Start */
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

this.getNodes()

setInterval(this.randomInactiveNodes, 10000); // Randomly activates node

$('#logout').on('click', function () {
    window.location.href = '/homepage/logout/'
})
/* End Functions */

/* Globals start */
var patterns = [];
for (var i = 0; i < 99; i++) { //max 99 patterns
    var pattern = {};
    pattern['nodes'] = [];
    pattern['links'] = 0;
    patterns.push(pattern);
}

//this.canvas = d3.select('#canvas').append('svg:svg').attr('width', '1200').attr('height', '800');
var svg = d3.select('#canvas').append('svg').attr('width', '100%').attr('height', '100%')
    .call(d3.behavior.zoom().on("zoom", function () {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    }))
    .append("g")
this.vis = svg.append('svg:g');

this.vis.append('svg:g').attr('class', 'linkContainer');
this.vis.append('svg:g').attr('class', 'nodeContainer');

this.forceLayout = d3.layout.force().size([1200, 800]).nodes([]).links([])
    .charge(-4000)
    .on("tick", this._tick.bind(this));

var force = d3.layout.force(),
    safety = 0;
while (force.alpha() > 0.05) { // You'll want to try out different, "small" values for this
    force.tick();
    if (safety++ > 500) {
        break;// Avoids infinite looping in case this solution was a bad idea
    }
}

if (safety < 500) {
    console.log('success??');
}

/* Globals End */

/* Button Event Start */
document.querySelector('#btn_node').addEventListener('click', e => {
    var e = document.getElementById("add_pattern_dropdown");
    console.log(e.options)
    var pattern = e.options[e.selectedIndex].value;
    if (patterns[pattern].nodes.length == 0) {
        // 0 is non-connector, 1 is connector
        this.addNode(1, pattern);
    } else {
        this.addNode(0, pattern);
    }
});

document.querySelector('#btn_link').addEventListener('click', e => {
    var e = document.getElementById("add_source");
    var source = e.options[e.selectedIndex].value;
    var f = document.getElementById("add_target");
    var target = f.options[f.selectedIndex].value;
    this.createLink(source, target)
});

document.querySelector('#btn_delete').addEventListener('click', e => {
    var e = document.getElementById("delete_pattern_dropdown");
    var pattern = e.options[e.selectedIndex].value;
    var f = document.getElementById("delete_node");
    var id = f.options[f.selectedIndex].value;
    this.deleteNode(pattern, id);
});

document.querySelector('#btn_node_active').addEventListener('click', e => {
    var e = document.getElementById("activate_dropdown");
    var id = e.options[e.selectedIndex].value;
    this.activateNode(id);
});


/* Button Event End */

function addNode(type, pattern) {
    console.log(patterns)
    if (patterns[pattern].nodes.length == 7) $(this).trigger(M.toast({html: 'Error: Pattern cannot contain more than 7 nodes'})); //no more than 7 nodes
    let id = this._nextID()
    let number = 'N' + ("0" + id).slice(-2);

    const node = {
        id: id,
        number: number,
        type: type,
        status: true,
        pattern: convertPatternToString(pattern),
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
    data.link = this.forceLayout.links()
    if (patterns[pattern].nodes.length === 1) {
        // TODO: This could be a problem, but you cant just create one
        // Adding a new connector node
        // data.link.push({
        //     'source': {'id': id, 'number': number, 'pattern': convertPatternToString(pattern), 'type': 1},
        //     'target': {'id': id, 'number': number, 'pattern': convertPatternToString(pattern), 'type': 1}
        // })
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

function getNodes() {
    // GET current nodes in database
    $.ajax({
        url: "/homepage/get/", // the endpoint
        type: "GET", // http method

        // handle a successful response
        success: function (response) {
            if (response == '') {
                updateDropDown([], [])
                return
            }
            var json = JSON.parse(response)
            let nodelist = []

            json.node.forEach(function (e) {
                let numNodes = 7, i = 0, currentPattern = 1
                if (convertPatternToInt(e.pattern) != currentPattern) {
                    i = 0
                    currentPattern = convertPatternToInt(e.pattern)
                }
                const node = {
                    id: e.id,
                    number: e.number,
                    type: e.type,
                    status: e.status,
                    pattern: e.pattern,
                };
                nodelist.push(node)
            });
            draw(nodelist, json.link)
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}

function activateNode(id) {
    let data = {
        'node': []
    }
    const node = {
        id: id,
    };
    data.node.push(node)

    $.ajax({
        url: "/homepage/activeNode/", // the endpoint
        type: "Post", // http method
        data: JSON.stringify(data),

        // handle a successful response
        success: function (response) {
            if (response == '') return
            var json = JSON.parse(response)
            updateStatus(json.node)
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            // console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $(this).trigger(M.toast({html: xhr.responseJSON.message}))

        }
    });
}

function randomInactiveNodes() {
    var exists = false
    this.forceLayout.nodes().forEach(function (e) {
        if (e.type == 0)
            exists = true
    });
    if (!exists) return
    $.ajax({
        url: "/homepage/inactiveNode/", // the endpoint
        type: "Post", // http method

        // handle a successful response
        success: function (response) {
            if (response == '') return
            var json = JSON.parse(response)
            updateStatus(json.node)
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}

// Updates the status (active/inactive) randomly of nodes
function updateStatus(newNodes) {
    this.forceLayout.nodes().forEach(function (node, index) {
        newNodes.forEach(function (j) {
            if (node.id == j.id)
                node.status = j.status
        })
    });
    const nodes = this.forceLayout.nodes()
    const sel = this.vis.select('.nodeContainer').selectAll('.node');

    //update status
    sel.each(function (d) {
        const node = d3.select(this);
        node.append('circle').attr('r', 0)
            .style('fill', d => d.type == 1 ? "blue" : (d.status == true ? "white" : "red"))
            .transition().duration(750).ease('elastic')
            .attr('r', 20);
        node.append('text')
            .text(node => node.number)
            .attr('font-size', 8)
            .attr('dx', -6)
            .attr('dy', 4)
        node.append('text')
            .text(node => node.type === 1 ? "" + node.pattern : '')
            .attr('font-size', 8)
            .attr('fill', 'black')
            .attr('dx', 25)
            .attr('dy', 4)
    })
    this._redraw()
}

function createLink(s, t) {
    let source = -1, target = -1;

    if (this._verifyNewLink(s, t)) {
        source = find(s)
        target = find(t)
    } else {
        $(this).trigger(M.toast({html: 'Error: Cannot create link'}))
        return
    }

    this.forceLayout.links().push({
        source, target
    });
    this._updateLinks()
    let data = {
        'link': []
    }
    data.link = this.forceLayout.links()
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

    this._redraw();


}

function _verifyNewLink(source, target) {
    return (
        source != target &&
        !this._findLink(source, target));
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
    // Remove Node
    let id = _id;
    let nodes = this.forceLayout.nodes();
    let links = this.forceLayout.links();

    var found = false;
    for (var j = 0; j < patterns[pattern].nodes.length; j++) {
        if (patterns[pattern].nodes[j].id == id) {
            found = true;
            break;
        }
    }

    if (!found) {
        $(this).trigger(M.toast({html: 'Error: Node is not in selected pattern'}));
        return
    }


    let data = {
        'link': []
    }
    // data.link = this.forceLayout.links()
    data.link.push({
        'source': {'id': id}
    })
    $.ajax({
        url: "/homepage/deleteNode/", // the endpoint
        type: "POST", // http method
        data: JSON.stringify(data),

        // handle a successful response
        success: function (response) {
            console.log("success"); // another sanity check
            let json = JSON.parse(response)
            console.log(json)

            //_redraw()
            // let i = 0;
            // while (i < nodes.length) {
            //     if (nodes[i].id == id) {
            //         patterns[pattern].nodes.splice(i, 1);
            //         nodes.splice(i, 1);
            //     }
            //     else
            //         i++;
            // }
            // // Remove Link
            // i = 0;
            // while (i < links.length) {
            //     if ((links[i].source.id == id) || (links[i].target.id == id)) {
            //         links.splice(i, 1);
            //     }
            //     else
            //         i++;
            // }
            draw(json.node, json.link)
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            // $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
            //     " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            // console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $(this).trigger(M.toast({html: xhr.responseJSON.message}))
        }
    });

}

function _tick() {

    var safety = 0;
    while (this.forceLayout.alpha() > 0.05) { // You'll want to try out different, "small" values for this
        this.forceLayout.tick();
        if (safety++ > 500) {
            break;// Avoids infinite looping in case this solution was a bad idea
        }
    }
    if (safety < 500) {
        console.log('success??');
    }
    this.vis.selectAll('.node').attr('transform', d => `translate(${d.x}, ${d.y})`);

    this.vis.selectAll(".link").attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
}

function _redraw() {
    this._updateNodes();
    this._updateLinks();
    this.forceLayout.start();
}

//Draws nodes and links from database on GET page load
function draw(nodes, links) {
    patterns = [];
    for (var i = 0; i < 99; i++) { //max 99 patterns
        var pattern = {};
        pattern['nodes'] = [];
        pattern['links'] = 0;
        patterns.push(pattern);
    }
    this.forceLayout.nodes().length = 0
    this.forceLayout.links().length = 0
    nodes.forEach(function (e) {
        e.x = 500
        e.y = 500
        e.px = 500
        e.py = 500
        console.log(e)

        this.forceLayout.nodes().push(e)
        let pattern = convertPatternToInt(e.pattern)
        patterns[pattern].nodes.push(e)
    });
    links.forEach(function (e) {
        let source = find(e.source.id)
        let target = find(e.target.id)
        this.forceLayout.links().push({
            source, target
        });
    });
    updateDropDown(nodes, links)
    this._redraw()
}

function _updateNodes() {
    const nodes = this.forceLayout.nodes()
    const sel = this.vis.select('.nodeContainer').selectAll('.node');
    const binding = sel.data(nodes, function (d) {
        return d.id
    }); //key that defines each item in the array. https://stackoverflow.com/questions/44891369/how-to-remove-node-in-d3-force-layout

    binding.enter().insert('g').attr('class', 'node').style('z-index', 1).call(sel => {
        sel.each(function (d) {
            const node = d3.select(this);
            // if(d.type == 1) node.classed("fixed", d.fixed = true);
            node.append('circle').attr('r', 0)
                .style('fill', d => d.type == 1 ? "blue" : (d.status == true ? "white" : "red"))
                .transition().duration(750).ease('elastic')
                .attr('r', 20);
            node.append('text')
                .text(node => node.number)
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

    this.updateDropDown(nodes, this.forceLayout.links())

    this.forceLayout.start();

}

function _updateLinks() {
    const layout_links = this.forceLayout.links()
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

function convertPatternToString(patId) {
    return 'P' + ("0" + patId).slice(-2)
}

function convertPatternToInt(pattern) {
    return parseInt(pattern.substr(1), 10)
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

function updateDropDown(nodes, link) {
    // Add Node
    let numPatterns = 0
    var select = document.getElementById("add_pattern_dropdown");
    $('#add_pattern_dropdown').empty()
    nodes.forEach(function (name, value) {
        if (name.type == 1) {
            numPatterns++
            var option = document.createElement('option');
            option.text = name.pattern;
            option.value = convertPatternToInt(name.pattern)
            select.add(option, 0);
        }
    })
    var option = document.createElement('option');
    option.text = 'New Pattern'
    option.value = numPatterns + 1;
    select.add(option, 0);

    //Delete Node
    var select = document.getElementById("delete_pattern_dropdown");
    $('#delete_pattern_dropdown').empty()
    nodes.forEach(function (name, value) {
        if (name.type == 1) {
            var option = document.createElement('option');
            option.text = name.pattern;
            option.value = convertPatternToInt(name.pattern)
            select.add(option, 0);
        }
    })

    var select = document.getElementById("delete_node");
    $('#delete_node').empty()
    nodes.forEach(function (name, value) {
        var option = document.createElement('option');
        option.text = name.number;
        option.value = name.id
        select.add(option, 0);
    })

    // Activate node
    var select = document.getElementById("activate_dropdown");
    $('#activate_dropdown').empty()
    nodes.forEach(function (name, value) {
        if (name.type == 0) {
            var option = document.createElement('option');
            option.text = name.number;
            option.value = name.id
            select.add(option, 0);
        }
    })

    // Links
    $('#add_source').empty()
    $('#add_target').empty()
    var selectSource = document.getElementById("add_source");
    nodes.forEach(function (name, value) {
        var option = document.createElement('option');
        option.text = name.number;
        option.value = name.id
        selectSource.add(option, 0);
    })

    var selectTarget = document.getElementById("add_target");
    nodes.forEach(function (name, value) {
        var option = document.createElement('option');
        option.text = name.number;
        option.value = name.id
        selectTarget.add(option, 0);
    })
    $('select').formSelect();
}




