/* Functions Start */
!function isAdmin() {
    let cookie = document.cookie;
    let cookieArr = cookie.split(";");
    for (let i in cookieArr) {
        let key = cookieArr[i].split("=")[0];
        key = key.trim();
        if (key == "is_superuser") {
            let isAdmin = cookieArr[i].split("=")[1].trim();
            var x = document.getElementById("admin");
            if (isAdmin == 'True') {
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

$('#logout').on('click', function () {
    window.location.href = '/homepage/logout/'
})
/* End Functions */

/* Globals start */
var domains = []
for (var i = 0; i < 99; i++) { //max 99 patterns
    var domain = {};
    domain['id'] = -1;
    domain['number'] = ''
    domain['patterns'] = []
    domain['connectors'] = [];
    domains.push(domain);
}
var patterns = [];
for (var i = 0; i < 99; i++) { //max 99 patterns
    var pattern = {};
    pattern['nodes'] = [];
    pattern['links'] = 0;
    patterns.push(pattern);
}

var randomCounter = 0

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
    // Do nothing
}

// Array for the path if requested
var path = []

// Groups
// var hull = this.vis.append("path")
//     .attr("class", "hull");
// var nodeSaver = this.vis.select('.nodeContainer').selectAll('.node');
// var vertices = []
//
// setInterval(this.generateRandomCall, 60000); // Randomly activates node

/* Globals End */

/* Button Event Start */
document.querySelector('#btn_node').addEventListener('click', e => {
    var e = document.getElementById("add_pattern_dropdown");
    var pattern = e.options[e.selectedIndex].value;

    var f = document.getElementById("add_domain_dropdown");
    var domain = f.options[f.selectedIndex].value;

    if (this.forceLayout.nodes().length == 0) {
        // Need to add domain node
        this.addNode(1, pattern, -1, domain) // very first node
    } else if (domains[domain].patterns.length == 0) {
        // if new domain, then make sure new pattern as well
        if (patterns[pattern].nodes.length != 0) {
            $(this).trigger(M.toast({html: 'Error: Pattern already exists in another domain.'}));
        } else {
            // create new domain AND pattern by creating a new connector node
            // the rest is handled in add node
            this.addNode(1, pattern, -1, domain) // very first node
        }
    } else if (!domains[domain].patterns.includes(parseInt(pattern)) && patterns[pattern].nodes.length != 0) {
        //domain has patterns but not the selected pattern
        $(this).trigger(M.toast({html: 'Error: selected pattern is not inside selected domain'}));
    } else if (patterns[pattern].nodes.length == 0) {
        // New Connector Node, prompt modal
        var connectorNodes = []
        this.forceLayout.nodes().forEach(function (node) {
            if (node.type == 1) connectorNodes.push(node)
        })
        if (connectorNodes.length > 0) {
            // Link new pattern to modal selected pattern
            $('#modal_text').text('Add new connector to what pattern?')
            $('#modalButton').click()
            return;
        }
    } else if (patterns[pattern].nodes.length == 7) {
        $('#modal_text').text('Error: Pattern cannot contain more than 7 nodes. Create new pattern linked to which existing pattern?')
        $('#modalButton').click()
        return;
    } else {
        this.addNode(0, pattern, -1, domain);
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
    this.prepareDelete(pattern, id);
});

document.querySelector('#btn_node_active').addEventListener('click', e => {
    var e = document.getElementById("activate_dropdown");
    var id = e.options[e.selectedIndex].value;
    this.activateNode(id);
});

document.querySelector('#modal_btn_node').addEventListener('click', e => {
    var e = document.getElementById("modal_pattern_dropdown");
    var linkPattern = e.options[e.selectedIndex].value;
    var f = document.getElementById("add_pattern_dropdown");
    var pattern = f.options[f.selectedIndex].value;
    var g = document.getElementById("add_domain_dropdown");
    var domain = g.options[g.selectedIndex].value;

    var linkPatternID = -1 // This is the id of the connector node

    if (patterns[pattern].nodes.length == 7) {
        // pattern is new pattern
        pattern = this._nextPatternID()
    } // Otherwise use intended pattern

    this.forceLayout.nodes().forEach(function (node) {
        if (node.type != 2 && convertPatternToInt(node.pattern) == linkPattern) {
            if (node.type == 1) linkPatternID = node.id
        }
    })
    if (linkPatternID != -1) {
        if (domains[domain].connectors.includes(linkPatternID)) { // compare with connector node id
            this.addNode(1, pattern, linkPatternID, domain);
        } else {
            $(this).trigger(M.toast({html: 'Error: unable to add new pattern to specified pattern. Not in domain.'}));
        }
    }

    else
        $(this).trigger(M.toast({html: 'Error: unable to add new pattern to specified link.'}));
});

$('#send').on('click', function () {
    let text = $('#input_text').val()
    let textLen = $('#input_text').val().length;
    if (textLen > 50) {
        $('#send').trigger(M.toast({html: 'The length of the text should below 50.'}))
    } else if (textLen < 1) {
        $('#send').trigger(M.toast({html: 'Please enter your message.'}))
    } else {
        // Send message, get shortest path
        // Gets source, target, and distance
        var e = document.getElementById("text_source_dropdown");
        var f = document.getElementById("text_target_dropdown");
        var id1 = e.options[e.selectedIndex].value;
        var id2 = f.options[f.selectedIndex].value;

        var paths = setPath()
        var sp = new ShortestPathCalculator(forceLayout.nodes(), paths);
        var route = sp.findRoute(find(id1), find(id2));

        // Formats result of path
        var translatedRoute = []
        translatedRoute["source"] = nodesIndexToID(route.source)
        translatedRoute["target"] = nodesIndexToID(route.target)
        translatedRoute["msg"] = route.mesg
        translatedRoute["distance"] = route.distance
        translatedRoute["paths"] = []
        if (route.path == null) {
            $(this).trigger(M.toast({html: 'Error: Unable to find a path.'}));
            console.log('no path found')
        } else {
            route.path.forEach(function (p) {
                const path = {
                    source: nodesIndexToID(p.source),
                    target: nodesIndexToID(p.target)
                }
                translatedRoute.paths.push(path)
            })
            drawPath(translatedRoute.paths)
            setTimeout(clearPath, 10000)
        }

        let data = {
            'message': text,
            'id': id2
        }

        $.ajax({
            url: "/homepage/addMessage/", // the endpoint
            type: "POST", // http method
            data: JSON.stringify(data),

            // handle a successful response
            success: function (response) {
                console.log("Message sent"); // another sanity check

            },

            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        });
    }
})

/* Button Event End */

function addNode(type, pattern, linkPattern, domainNumber) {
    if (patterns[pattern].nodes.length == 7) {
        // Should never display
        $(this).trigger(M.toast({html: 'Error: Pattern cannot contain more than 7 nodes'})); //no more than 7 nodes
    }

    let id = this._nextID()
    let number = 'N' + ("0" + id).slice(-2);

    const node = {
        id: id,
        number: number,
        type: type,
        status: true,
        pattern: convertPatternToString(pattern),
        domain: domainNumber,
        x: Math.random(),
        y: Math.random()
    };

    if (type != 2) {
        // Dont push domain node to pattern node tracker
        patterns[pattern].nodes.push(node);
    }
    this.forceLayout.nodes().push(node);

    // If connector node, link with domain node
    if (type == 1) {
        if (domains[domainNumber].patterns.length == 0) {
            var domainId = this.addDomain()
            domains[domainNumber].id = domainId
            domains[domainNumber].patterns.push(convertPatternToInt(node.pattern))
            domains[domainNumber].connectors.push(node.id)
            this.addLink(id, domainId)
        } else {
            domains[domainNumber].patterns.push(convertPatternToInt(node.pattern))
            domains[domainNumber].connectors.push(node.id)
            this.addLink(id, domains[domainNumber].id)
        }
    }

    if (patterns[pattern].nodes.length == 1) {
        // Connect it with another connector
        if (linkPattern != -1) {
            // Link new pattern to selected existing pattern
            this.addLink(patterns[pattern].nodes[0].id, linkPattern)
        }
    }

    let nodes = patterns[pattern].nodes; //Nodes in current pattern
    let links = this.forceLayout.links()
    let size = nodes.length; //Length of current pattern nodes

    let connectorID = patterns[pattern].nodes[0].id
    patterns[pattern].nodes.forEach(function (node) {
        if (node.type == 1) connectorID = node.id
    })

    if (nodes.length >= 1 && nodes.length < 3) {
        //link with connector
        this.addLink(connectorID, nodes[size - 1].id); // connector index, index of last addition
        patterns[pattern].links++;
    } else if (size < 4) {
        // Adding node 3
        //close loop with connector
        this.addLink(connectorID, nodes[size - 1].id); // connector index, index of last addition
        this.addLink(nodes[size - 1].id, nodes[size - 2].id);
    } else if (size == 4) {
        // Adding node 4
        //close loop with connector
        this.addLink(connectorID, nodes[size - 1].id); // connector index, index of last addition
        this.addLink(nodes[size - 1].id, nodes[size - 2].id);
        this.addLink(nodes[size - 1].id, nodes[size - 3].id);
    } else if (size == 5) {
        // Need to do because of the way delete works
        // Connect with nodes with only 2 links
        var nodesWith2Links = []
        nodes.forEach(function (node) {
            var linkCount = [];
            links.forEach(function (e) {
                if (e.source.type == 2 || e.target.type == 2) {
                    // Do nothing. Domain link
                } else {
                    if (e.source.id == node.id && !linkCount.includes(e.target.id)) {
                        linkCount.push(e.target.id)
                    } else if (e.target.id == node.id && !linkCount.includes(e.source.id)) {
                        linkCount.push(e.source.id)
                    }
                }
            })
            if (linkCount.length == 2) nodesWith2Links.push(node)
        })

        if (nodesWith2Links.length != 2) {
            //remove links between last node added, and first nonconnector node
            // will always work because prior, everything connected to everything
            this.removeLinkBetween(nodes[size - 2].id, nodes[1].id);
            //close loop with new node and first non nonconnector connector
            this.addLink(nodes[size - 1].id, nodes[1].id);
            this.addLink(nodes[size - 1].id, nodes[size - 2].id);
        } else {
            //close loop with new node and first non nonconnector connector
            this.addLink(nodes[size - 1].id, nodesWith2Links[0].id);
            this.addLink(nodes[size - 1].id, nodesWith2Links[1].id);
        }
    } else {
        var nodesWith2Links = []
        nodes.forEach(function (node) {
            var linkCount = [];
            links.forEach(function (e) {
                if (e.source.type == 2 || e.target.type == 2) {
                    // Do nothing. Domain link
                } else {
                    if (e.source.id == node.id && !linkCount.includes(e.target.id)) {
                        linkCount.push(e.target.id)
                    } else if (e.target.id == node.id && !linkCount.includes(e.source.id)) {
                        linkCount.push(e.source.id)
                    }
                }
            })
            if (linkCount.length == 2) nodesWith2Links.push(node)
        })

        //get neighbor of node w 2 links
        var neighbor = []
        links.forEach(function (e) {
            if (e.source.type == 2 || e.target.type == 2) {
                // Do nothing. Domain link
            } else {
                if (e.source.id == nodesWith2Links[0].id && !neighbor.includes(e.target.id)) {
                    neighbor.push(e.target.id)
                } else if (e.target.id == nodesWith2Links[0].id && !neighbor.includes(e.source.id)) {
                    neighbor.push(e.source.id)
                }
            }
        })

        this.removeLinkBetween(nodesWith2Links[0].id, neighbor[0]);
        //close loop with new node and first non nonconnector connector
        this.addLink(nodes[size - 1].id, nodesWith2Links[0].id);
        this.addLink(nodes[size - 1].id, neighbor[0]);
    }

    let data = {
        'link': []
    }
    data.link = this.forceLayout.links()
    if (patterns[pattern].nodes.length == 1) {
        // Do nothing
    }
    $.ajax({
        url: "/homepage/addNode/", // the endpoint
        type: "POST", // http method
        data: JSON.stringify(data),

        // handle a successful response
        success: function (response) {
            // console.log(JSON.parse(response)) // log the returned json to the console
            console.log("success"); // another sanity check
            var modal = document.getElementById('myModal');
            modal.style.display = "none";
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

function addDomain() {
    let id = this._nextID()
    let number = 'D' + ("0" + this._nextDomainID()).slice(-2);

    const domain = {
        id: id,
        number: number,
        type: 2,
        status: true,
        //pattern: convertPatternToString(pattern),
        x: Math.random(),
        y: Math.random()
    };
    this.forceLayout.nodes().push(domain);
    return id
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
                // Seperate domain nodes from the rest
                if (e.type == 2) {
                    // Dealing with domain nodes only
                    var domainNumber = convertDomainToInt(e.number)
                    domains[domainNumber].id = e.id
                    const node = {
                        id: e.id,
                        number: e.number,
                        type: e.type,
                        status: e.status,
                    };
                    nodelist.push(node)
                } else {
                    if (e.type == 1) { // Dealing with connectors
                        json.link.forEach(function (f) {
                            if (f.source.id == e.id) { // might be a problem if domain node is a source only. maybe search both
                                if (f.target.type == 2) {
                                    var domainNumber = convertDomainToInt(f.target.number)
                                    domains[domainNumber].patterns.push(convertPatternToInt(e.pattern))
                                    domains[domainNumber].connectors.push(e.id)
                                }
                            }
                        })

                    }
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
                }
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

function generateRandomCall() {
    var rounded = Math.round(Math.random() * 10) / 10;
    randomCounter += rounded
    if (randomCounter > 4.7 && randomCounter < 5.0) this.randomInactiveNodes()
    if (randomCounter > 5.0) randomCounter = 0
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
        // .style('fill', d => d.type == 1 ? "blue" : (d.status == true ? "white" : "red"))
            .style('fill', d => d.status == true ? (d.type == 1 ? "blue" : "white") : "red")
            .transition().duration(750).ease('elastic')
            .attr('r', 20);
        node.append('text')
            .text(node => node.number)
            .attr('font-size', 8)
            .attr('dx', -6)
            .attr('dy', 4)
        node.append('text')
            .text(node => node.type == 1 ? "" + node.pattern : '')
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

    if (this.forceLayout.nodes()[source].type == 0 || this.forceLayout.nodes()[target].type == 0) {
        $(this).trigger(M.toast({html: 'Error: You can only link connecor nodes'}))
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
        if ((links[i].source.id == id1 && links[i].target.id == id2) ||
            (links[i].source.id == id2 && links[i].target.id == id1)) {
            this.forceLayout.links().splice(i, 1);

        }

        else
            i++;
    }

    let data = {
        'node1': {id: id1},
        'node2': {id: id2}
    }
}

// Use only in delete!!!
function moveConnectorTo(pattern, s, t) {
    let nodes = this.forceLayout.nodes();
    let links = this.forceLayout.links();

    let source = -1, target = -1;

    let connectorID = patterns[pattern].nodes[0].id
    patterns[pattern].nodes.forEach(function (node) {
        if (node.type == 1) connectorID = node.id
    })

    if (!this._findLink(connectorID, s)) {
        console.log('source is not linked with connector');
        return
    }

    //Remove old link from connector to source
    let i = 0;
    while (i < links.length) {
        if ((links[i].source.id == s && links[i].target.id == connectorID) ||
            (links[i].source.id == connectorID && links[i].target.id == s)) {
            this.forceLayout.links().splice(i, 1);
        }
        else
            i++;
    }

    //Check and add new link
    if (this._verifyNewLink(t, connectorID)) {
        // source = patterns[pattern].nodes[0].id;
        // target = nodes[t].id;
        // target = nodes[t].id;
        source = find(connectorID)
        target = find(t)
    } else {
        console.error('unable to create link');
        return
    }

    this.forceLayout.links().push({
        source, target
    });

    // this._updateLinks()
    const layout_links = this.forceLayout.links()
    const linksUpdated = this.vis.select('.linkContainer').selectAll(".link").data(layout_links);
    linksUpdated.enter().insert('line').attr('class', 'link').style('stroke', 'white').style('stroke-width', 5)
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    linksUpdated.exit().remove();
    this.forceLayout.start();

    // update database with new links
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
            deleteNode(pattern, s)
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}

function _getConnectorLinks(id) {
    let i = 0, count = 0;
    while (i < links.length) {
        if (links[i].source.id == id || links[i].target.id == id)
            count++;
        else
            i++;
    }
    return count;
}

function prepareDelete(pattern, _id) {
    // Remove Node
    let id = _id;
    let nodes = this.forceLayout.nodes();
    let links = this.forceLayout.links();

    // Make sure node exists in pattern
    var found = false;
    for (var j = 0; j < patterns[pattern].nodes.length; j++) {
        if (patterns[pattern].nodes[j].id == id) {
            found = true;
            if (patterns[pattern].nodes[j].type == 1) {
                // Skip ahead and either delete it or error
                this.deleteNode(pattern, id)
                console.log('regular delete')
                return
            }
            break;
        }
    }
    if (!found) {
        $(this).trigger(M.toast({html: 'Error: Node is not in selected pattern'}));
        return
    }

    var linkCount = [];
    links.forEach(function (e) {
        if (e.source.id == id && !linkCount.includes(e.target.id)) {
            linkCount.push(e.target.id)
        } else if (e.target.id == id && !linkCount.includes(e.source.id)) {
            linkCount.push(e.source.id)
        }
    })

    if (linkCount.length < 3) {
        // Regular delete
        this.deleteNode(pattern, id)
        console.log('regular delete')
        return
    }

    // only 4 nodes left
    if (patterns[pattern].nodes.length == 4) {
        // Regular delete
        this.deleteNode(pattern, id)
        console.log('regular delete')
        return
    }

    //else node has 3 links and needs to move one
    console.log('need to move')
    console.log(links)
    var linkedToConnectorIds = []
    var unlinkedToConnector = []
    // Check which node is being deleted
    links.forEach(function (e) {
        if ((e.source.id == id && e.target.type == 1) || (e.source.type == 1 && e.target.id == id)) {
            // if node to be deleted is linked with the connector
            // get all nodes in pattern linked to connector
            console.log(e)
            links.forEach(function (e) {
                if (e.source.pattern == convertPatternToString(pattern) && e.target.pattern == convertPatternToString(pattern)) {
                    // Dealing with links only in pattern
                    console.log('pattern check')
                    if (e.target.type == 1) {
                        linkedToConnectorIds.push(e.source)
                    } else if (e.source.type == 1) {
                        linkedToConnectorIds.push(e.target)
                    }
                }
            })

            // then get all nodes NOT linked to the connector
            patterns[pattern].nodes.forEach(function (e) {
                unlinkedToConnector.push(e)
            })
            linkedToConnectorIds.forEach(function (linked) {
                var i = 0;
                while (i < unlinkedToConnector.length) {
                    if (unlinkedToConnector[i].id == linked.id || unlinkedToConnector[i].type == 1) {
                        unlinkedToConnector.splice(i, 1);
                    }
                    else
                        i++;
                }
            })
        }
    });
    // then pick a random node NOT linked to connector, and move link
    // from node 2b deleted to new unlinked node
    console.log(linkedToConnectorIds)
    console.log(unlinkedToConnector)
    var newId = unlinkedToConnector[Math.floor(Math.random() * unlinkedToConnector.length)].id
    this.moveConnectorTo(pattern, id, newId)
}

function deleteNode(pattern, _id) {
    // Remove Node
    let id = _id;
    let nodes = this.forceLayout.nodes();
    let links = this.forceLayout.links();

    // Make sure node exists in pattern
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
            let i = 0;
            while (i < nodes.length) {
                if (nodes[i].id == id) {
                    patterns[pattern].nodes.splice(i, 1);
                    nodes.splice(i, 1);
                }
                else
                    i++;
            }

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
        // Do nothing
    }

    this.vis.selectAll(".link").attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    this.vis.selectAll('.node').attr('transform', d => `translate(${d.x}, ${d.y})`);

    // nodeSaver.data().forEach(function (d, i) {
    //     vertices[i] = [d.x, d.y];
    // })
    //
    //
    // hull.datum(d3.geom.hull(vertices)).attr("d", function (d) {
    //     return "M" + d.join("L") + "Z";
    // });
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
        this.forceLayout.nodes().push(e)
        if (e.type != 2) {
            let pattern = convertPatternToInt(e.pattern)
            patterns[pattern].nodes.push(e)
        }
    });
    links.forEach(function (e) {
        let source = find(e.source.id)
        let target = find(e.target.id)
        this.forceLayout.links().push({
            source, target
        });
    });
    this.updateDropDown(nodes, links)
    this._redraw()
}

function _updateNodes() {
    const nodes = this.forceLayout.nodes()
    const sel = this.vis.select('.nodeContainer').selectAll('.node');

    const binding = sel.data(nodes, function (d) {
        return d.id
    }); //key that defines each item in the array. https://stackoverflow.com/questions/44891369/how-to-remove-node-in-d3-force-layout

    nodeSaver = binding.enter().insert('g').attr('class', 'node').style('z-index', 1).call(sel => {
        sel.each(function (d) {
            const node = d3.select(this);

            node.append("circle")
                .attr("r", function (d) {
                    if (d.type == 2)
                        return 0;
                    return 20
                })
                .style('fill', d => d.status == true ? (d.type == 1 ? "blue" : "white") : "red")
                .transition().duration(750).ease('elastic')

            node.append("rect")
                .attr("width", function (d) {
                    if (d.type != 2)
                        return 0;
                    return 40
                })
                .attr("height", function (d) {
                    if (d.type != 2)
                        return 0;
                    return 40
                })
                .style('fill', d => d.status == true ? (d.type == 1 ? "blue" : "white") : "red")
                .transition().duration(750).ease('elastic')


            //node.append('circle').attr('r', 0)
            //     .style('fill', d => d.status == true ? (d.type == 1 ? "blue" : "white") : "red")
            //     .transition().duration(750).ease('elastic')
            //     .attr('r', 20);
            node.append('text')
                .text(node => node.number)
                .attr('font-size', 8)
                .attr('dx', -6)
                .attr('dy', 4)
            node.append('text')
                .text(node => node.type == 1 ? "" + node.pattern : '')
                //.text(node => node.type == 1 ? "" + node.pattern : node.type == 2 ? "" + node.domain : '')
                .attr('font-size', 8)
                .attr('fill', 'black')
                .attr('dx', 25)
                .attr('dy', 4);
            node.on("click", clickNode);

        });
    }).call(this.forceLayout.drag);

    binding.exit().remove();
    binding.exit().remove();

    this.updateDropDown(nodes, this.forceLayout.links())

    this.forceLayout.start();
}

function _updateLinks() {
    const layout_links = this.forceLayout.links()
    const links = this.vis.select('.linkContainer').selectAll(".link").data(layout_links);
    links.enter().insert('line').attr("class", 'link').style('stroke', 'white').style('stroke-width', 5)
        .attr('id', d => d.source.id + "," + d.target.id)
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    links.transition().attr("class", 'link').style('stroke', function (d) {
        var isPath = false
        var path = getPath()
        if (typeof path !== 'undefined' && path.length > 0) {
            // Draw the path
            path.forEach(function (p) {
                if ((d.source.id == p.source && d.target.id == p.target) || (d.source.id == p.target && d.target.id == p.source)) {
                    isPath = true
                }
            })
            return isPath ? "blue" : "white"
        } else {
            // No path to draw
            return "white"
        }
    })
    // .style('stroke-width', 5)
    // .attr('id', d => d.source.id + "," + d.target.id)
    // .attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);


    links.exit().remove();

    this.forceLayout.start();
}

function _findNodeByID(id) {
    return this.forceLayout.nodes().filter(d => d.id == id)[0];
}

function _findPatternByID(id) {
    return this.forceLayout.nodes().filter(d => d.type != 2 && convertPatternToInt(d.pattern) == id)[0];
}

function _findDomainByID(id) {
    return this.forceLayout.nodes().filter(d => d.type == 2 && convertDomainToInt(d.number) == id)[0];
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

function _nextPatternID() {
    let id = 1;
    while (this._findPatternByID(id)) {
        id++;
    }
    return id;
}

function _nextDomainID() {
    let id = 1;
    while (this._findDomainByID(id)) {
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

function convertDomainToString(domainID) {
    return 'D' + ("0" + domainID).slice(-2)
}

function convertDomainToInt(domain) {
    return parseInt(domain.substr(1), 10)
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

function nodesIndexToID(ind) {
    var id = -1
    this.forceLayout.nodes().forEach(function (node, index) {
        if (index == ind)
            id = node.id
    });
    return id;
}

function updateDropDown(nodes, link) {
    // Domain
    var select = document.getElementById("add_domain_dropdown");
    $('#add_domain_dropdown').empty()
    nodes.forEach(function (name, value) {
        if (name.type == 2) {
            var option = document.createElement('option');
            option.text = name.number;
            option.value = convertDomainToInt(name.number)
            select.add(option, 0);
        }
    })
    var option = document.createElement('option');
    option.text = 'New Domain'
    option.value = _nextDomainID()
    select.add(option, 0);

    // Add Node
    var select = document.getElementById("add_pattern_dropdown");
    $('#add_pattern_dropdown').empty()
    nodes.forEach(function (name, value) {
        if (name.type == 1) {
            var option = document.createElement('option');
            option.text = name.pattern;
            option.value = convertPatternToInt(name.pattern)
            select.add(option, 0);
        }
    })
    var option = document.createElement('option');
    option.text = 'New Pattern'
    option.value = _nextPatternID()
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
        var option = document.createElement('option');
        option.text = name.number;
        option.value = name.id
        select.add(option, 0);
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

    // Add Node
    var select = document.getElementById("modal_pattern_dropdown");
    $('#modal_pattern_dropdown').empty()
    nodes.forEach(function (name, value) {
        if (name.type == 1) {
            var option = document.createElement('option');
            option.text = name.pattern;
            option.value = convertPatternToInt(name.pattern)
            select.add(option, 0);
        }
    })

    // Send Message
    $('#text_source_dropdown').empty()
    $('#text_target_dropdown').empty()

    var textSource = document.getElementById("text_source_dropdown");
    nodes.forEach(function (name, value) {
        var option = document.createElement('option');
        option.text = name.number;
        option.value = name.id
        textSource.add(option, 1);
    })

    var textTarget = document.getElementById("text_target_dropdown");
    nodes.forEach(function (name, value) {
        var option = document.createElement('option');
        option.text = name.number;
        option.value = name.id
        textTarget.add(option, 0);
    })

    $('select').formSelect();
}

function setPath() {
    var paths = []
    var links = this.forceLayout.links()
    var nodes = this.forceLayout.nodes()
    links.forEach(function (link) {
        var s = link.source
        var t = link.target
        if (s.status == true && t.status == true) { // Only active nodes
            let dist = Math.sqrt(Math.pow((s.x - t.x), 2) + Math.pow((s.y - t.y), 2));
            const path = {
                source: s.id,
                target: t.id,
                distance: Math.round(dist),
            };
            paths.push(path);
        }
    })
    return paths
}

function drawPath(path) {
    this.path = path
    this._redraw()
}

function getPath() {
    return this.path
}

function clearPath() {
    this.path = []
    this._redraw()
}

function clickNode(d) {
    console.log(d);
    $('#message_modal_id').text("ID: " + d.id)
    $('#message_modal_pattern').text("Pattern: " + d.pattern)
    $('#message_modal_status').text("Status: " + (d.status == true ? "Active" : "Inactive"))
    $('#message_modal_type').text("Type: " + (d.type == 0 ? "Non-connector" : "Connector"))
    $('#messages_list').empty()

    let data = {
        'id': d.id
    }

    $.ajax({
        url: "/homepage/getMessage/", // the endpoint
        type: "POST", // http method
        data: JSON.stringify(data),

        // handle a successful response
        success: function (response) {
            var resp = JSON.parse(response)
            if (resp.message.length == 0) {
                $(this).trigger(M.toast({html: 'Alert: Node contains no messages.'}))
            } else {
                var items = [];
                $.each(resp.message, function (i, item) {
                    items.push('<li>' + (i + 1) + " : " + item.message + '</li>');
                });
                $('#messages_list').append(items.join(''));
            }
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            // console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $(this).trigger(M.toast({html: xhr.responseJSON.message}))
        }
    });

    // Show the modal
    $('#messageModalButton').click()
}


