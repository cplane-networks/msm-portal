'use strict';

define(['app'], function (app) {

    var injectParams = ['$http', '$rootScope', 'AppConfig'];

    var graphFactory = function ($http, $rootScope, AppConfig) {

        var graphFactory = {};
        
        graphFactory.graph = new joint.dia.Graph;
        graphFactory.paper = new joint.dia.Paper({
            el: $('.draw-canvas-box'),
            width: 1000,
            height: 460,
            model: graphFactory.graph,
            gridSize: 1
        });
        var node_array = [];
        
        graphFactory.paper.on('cell:mouseover', function (cellView, evt) {
            //showTools(cellView.model);
        });
        
        graphFactory.paper.on('cell:mouseout', function (cellView, evt) {
            //hideTools();
            
        });
        
        graphFactory.paper.on('cell:contextmenu', function (cellView, evt) {
            //console.log(cellView.model.attributes.cplane_type);
            //showContextMenu(evt);
        });
        
        // Cplane Nodes.
        joint.shapes.basic.Openstack_site = joint.shapes.basic.Generic.extend({
            markup: '<g class="rotatable"><g class="scalable"><image/></g></g><text/>',
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_site',
                size: {width: 90, height: 90},
                attrs: {
                    image: {
                        'width': 100, 'height': 100,
                        'xlink:href': AppConfig.SVGIconPath + 'Cloud Site-OpenStack-Red.svg'
                    },
                    text: {
                        'font-size': 14,
                        'ref-x': 45,
                        'ref-y': 110,
                        'y-alignment': 'bottom',
                        'text-anchor': 'middle',
                        'fill': '#808080',
                        'font-family': 'arial',
                        'pointer-events': 'none'
                    },
                },
                cplane_type : 'openstack_site'
            }, joint.shapes.basic.Generic.prototype.defaults)
        });
            
        joint.shapes.basic.Openstack_subnet = joint.shapes.basic.Circle.extend({
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_subnet',
                size: { width: 100, height: 40 },
                attrs: { circle: { stroke: 'red', 'stroke-width': 1.5 }, 
                         text: { fill: 'black', 'font-size': 12} },
                cplane_type : 'openstack_subnet'
            }, joint.shapes.basic.Circle.prototype.defaults)
        });
        
        joint.shapes.basic.Openstack_ogr = joint.shapes.basic.Generic.extend({
            markup: '<g class="rotatable"><g class="scalable"><image/></g></g><text/>',
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_ogr',
                size: {width: 40, height: 40},
                attrs: {
                    image: {
                        'width': 100, 'height': 100,
                        'xlink:href': AppConfig.SVGIconPath + 'OGR - Red.svg'
                    }
                },
                cplane_type : 'openstack_ogr'
            }, joint.shapes.basic.Generic.prototype.defaults)
        });
        
        joint.shapes.basic.External_site = joint.shapes.basic.Generic.extend({
            markup: '<g class="rotatable"><g class="scalable"><image/></g></g><text/>',
            defaults: joint.util.deepSupplement({
                type: 'basic.External_site',
                size: {width: 90, height: 90},
                attrs: {
                    image: {
                        'width': 100, 'height': 100,
                        'xlink:href': AppConfig.SVGIconPath + 'Cloud Site - External - Blue.svg'
                    },
                    text: {
                        'font-size': 14,
                        'ref-x': 45,
                        'ref-y': 110,
                        'y-alignment': 'bottom',
                        'text-anchor': 'middle',
                        'fill': '#808080',
                        'font-family': 'arial',
                        'pointer-events': 'none'
                    },
                },
                cplane_type : 'external_site'
            }, joint.shapes.basic.Generic.prototype.defaults)
        });
        
        graphFactory.AddOpenStackSite = function(label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_site({ 
                position: node_position,
                attrs: {text: {text : label} }
            });
            
            node_array.push(node);
            graphFactory.graph.addCells(node_array);
            return node;
        };
        
        graphFactory.AddOpenStackSubnet = function(label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_subnet({ 
                position: node_position,
                attrs: {text: {text : label} }
            });
            
            node_array.push(node);
            graphFactory.graph.addCells(node_array);
            return node;
        };
        
        graphFactory.AddOpenStackOgr = function(node_position) {
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_ogr({ 
                position: node_position,
            });
            
            node_array.push(node);
            graphFactory.graph.addCells(node_array);
            return node;
        };
        
        graphFactory.AddExternalSite = function(label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.External_site({ 
                position: node_position,
                attrs: {text: {text : label} }
            });
            
            node_array.push(node);
            graphFactory.graph.addCells(node_array);
            return node;
        };
        
        graphFactory.AddLink = function(source_node, target_node) {
            //source_node : source_node_obj
            //target_node : target_node_obj
            var link = new joint.dia.Link({
                source: { id: source_node.id },
                target: { id: target_node.id },
            });
            
            node_array.push(link);
            graphFactory.graph.addCells(node_array);
            return link;
        };
		return graphFactory;
    };

    graphFactory.$inject = injectParams;

    app.factory('GraphService', graphFactory);

});