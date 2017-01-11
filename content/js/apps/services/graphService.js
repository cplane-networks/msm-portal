'use strict';

define(['app'], function (app) {

    var injectParams = ['$injector', '$rootScope', 'AppConfig'];

    var graphFactory = function ($injector, $rootScope, AppConfig) {

        var graphFactory = {};
        //var _this = this;
        var rightClickedCell = null;
        
        graphFactory.graph = new joint.dia.Graph;
        graphFactory.paper = new joint.dia.Paper({
            el: $('.draw-canvas-box'),
            width: $('.draw-canvas-box').width(),
            height: $('.draw-canvas-box').height(),
            model: graphFactory.graph,
            restrictTranslate: true,
            gridSize: 1
        });
        
        graphFactory.tooltip_content = function(id){
            var cellView = graphFactory.graph.getCell(id);
            var site_name = cellView.attributes.site_name
            var cplane_type = cellView.attributes.cplane_type
            
            var site_details = $injector.get('StorageService')['GetSite'](site_name).site_data;
            
            if (cplane_type === 'vm') {
                var vm_details = $injector.get('StorageService')['GetVM'](site_name, cellView.attributes.vm_srId, cellView.attributes.vm_name).vm_data;
		
                if (vm_details.floatIP === '') {
                    vm_details.floatIP = 'None';
                }
                //var content = '<span>Site: '+cellView.attributes.site_name+'<br/>VM: '+cellView.attributes.vm_name+'<br/>UUID: '+cellView.attributes.vm_uuid+'<br/>IP Address: '+vm_details.fixedIP+'<br/>Image: '+vm_details.imageRef+'<br/>Flavor: '+vm_details.flavorRef+'<br/>Floating IP: '+vm_details.floatIP+'<br/>srId: '+cellView.attributes.vm_srId+'</span>';   
				var content = '<span>VM: '+cellView.attributes.vm_name+'<br/>UUID: '+cellView.attributes.vm_uuid+'<br/>IP Address: '+vm_details.fixedIP+'<br/>Image: '+vm_details.imageRef+'<br/>Flavor: '+vm_details.flavorRef+'<br/>Floating IP: '+vm_details.floatIP+'<br/>Floating IP Quota: None</span>';
				return content;    
            } 
            
            if (cplane_type === 'openstack_ogr'){
                return '<span>cpeName : '+site_details.cpe[0].cpeName + '<br/> cpeSegmentation-Id : '+site_details.cpe[0].cpeSegmentationId+'<br/> cpeIpAddr : '+site_details.cpe[0].cpeIpAddr+'<br/> cpeMask : '+site_details.cpe[0].cpeMask+'<br/> cpeASN : '+site_details.cpe[0].cpeASN+'<br/> peerIP : '+site_details.cpe[0].peerIP+'<br/> peerASN : '+site_details.cpe[0].peerASN+'</span>'
            }
            else if (cplane_type === 'external_site'){
                var content = '<span>AS: '+site_details.as_number+'<br/>';
                for(var x=0; x < site_details.ip_range.length; x++){
                    content += 'IP Range: '+site_details.ip_range[x] +'<br/>'
                    content += 'Gateway: '+site_details.gateway_ip_address[x] +'<br/>'
                }
                content += '</span>'
                return content
            }
        }
        
        var element_tooltip = new joint.ui.Tooltip({
                className: 'tooltip',
                rootTarget: '.draw-canvas-box',
                target: '.Openstack_ogr,.External_site,.VM',
                content: function(cell) {
                    var id = $(cell).attr("model-id")
                    return graphFactory.tooltip_content(id);
                },
                direction: 'top',
                padding: 10 
                //bottom: function(target) { return target; },
        });

        element_tooltip.$el.css({
            'background-color': 'rgb(242, 242, 242)',
            'text-shadow': 'none',
            'position': 'absolute !important',
            'opacity': '1',
            'color': 'rgb(127,127,127)',
            'padding': '10px',
            'border': '1px solid #9c9c9c',
            'border-radius': '5px'
        });
        
        graphFactory.paper.on('cell:pointermove', function (cellView, evt) {
            element_tooltip.hide();
        });
        
        graphFactory.paper.on('cell:contextmenu', function (cellView, evt) {
            var cell = graphFactory.graph.getCell(cellView.model.attributes.id);
            var interactive = graphFactory.paper.findViewByModel(cell).options.interactive;
            if(cellView.model.attributes.cplane_type == "vm" && interactive){
                rightClickedCell = cellView;
                showContextMenu(evt);
            }
        });
        
        function showContextMenu(evt){
            graphFactory.$contextMenu.jqxMenu('open', evt.pageX, evt.pageY);
        }

        graphFactory.$contextMenu = $('' +
                              '<div class="context-menu">' +
                              '   <ul>' +      
                              '       <li id = "start">Start</li>' +
                              '       <li id = "stop">Stop</li>' +
                              '       <li id = "reboot">Reboot</li>' +
                              '       <li id = "delete">Delete</li>' +
                              '       <li id = "cancel">Console</li>' +
                              '   </ul>' +
                              '</div>');
        
        $('.paper').append(graphFactory.$contextMenu);
        graphFactory.$contextMenu.jqxMenu({
            width: '100px',
            autoOpenPopup: false,
            animationShowDuration: 0,
            animationHideDuration: 0,
            mode: 'popup'
        });

        $(document).on('contextmenu', function (e) {
          return false;
        });
        
        $('.context-menu').bind('itemclick', function (event) {
            //var LI_element = event.args;
            var menuitemText = $(args).text();
            var id = rightClickedCell.model.attributes.id;
            var cellView = graphFactory.graph.getCell(id);
            var site_name = cellView.attributes.site_name;
            var vm_name = cellView.attributes.vm_name;
            var vm_uuid = cellView.attributes.vm_uuid;
            var vm_srId = cellView.attributes.vm_srId;
            var cplane_type = cellView.attributes.cplane_type;
            var customer_name = $injector.get('StorageService')['GetCustomer']().customer_name;
            
            //$injector.get('MSMService')['GetSite'](site_name).site_data;
            //graphFactory.paper.$el.css('pointer-events', 'none');
            graphFactory.paper.findViewByModel(cellView).options.interactive = false;
            switch (menuitemText) {
                case "Start":
                    $injector.get('MSMService')['StartVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Stop":
                    $injector.get('MSMService')['StopVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Reboot":
                    $injector.get('MSMService')['RebootVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Delete":
                    $injector.get('MSMService')['DeleteVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Console":
                    graphFactory.paper.findViewByModel(cellView).options.interactive = true;
                    $injector.get('MSMService')['getVMConsole']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
            }
            
            rightClickedCell = null;
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
                cplane_type : 'openstack_site',
                site_name :''
            }, joint.shapes.basic.Generic.prototype.defaults)
        });
            
        joint.shapes.basic.Openstack_subnet = joint.shapes.basic.Ellipse.extend({
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_subnet',
                size: { width: 100, height: 40 },
                attrs: { ellipse: { stroke: 'red', 'stroke-width': 1.5 }, 
                         //text: { fill: 'black', 'font-size': 12} },
                         text: { fill: 'black', 'font-size': 12, 'ref-y': .55, ref: 'ellipse', 'y-alignment': 'middle'} },
                cplane_type : 'openstack_subnet',
                site_name : ''
            }, joint.shapes.basic.Ellipse.prototype.defaults)
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
                cplane_type : 'openstack_ogr',
                site_name : ''
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
                cplane_type : 'external_site',
                site_name : ''
            }, joint.shapes.basic.Generic.prototype.defaults)
        });
        
        joint.shapes.basic.Connect_site = joint.shapes.basic.Ellipse.extend({
            defaults: joint.util.deepSupplement({
                type: 'basic.Connect_site',
                size: { width: 110, height: 22 },
                attrs: { ellipse: { stroke: '#1C75BC', 'stroke-width': 1 }, 
                         //text: { fill: 'black', 'font-size': 12} },
                         text: { fill: 'black', 'font-size': 12, 'ref-y': .58, ref: 'ellipse', 'y-alignment': 'middle'} },
                cplane_type : 'connect_site'
            }, joint.shapes.basic.Ellipse.prototype.defaults)
        });
        
        joint.shapes.basic.VM = joint.shapes.basic.Rect.extend({
            defaults: joint.util.deepSupplement({
                type: 'basic.VM',
                size: { width: 150, height: 30 },
                attrs: { rect: { fill: 'red', rx: 5, ry: 5, 'stroke-width': 2, stroke: 'red' }, 
                         //text: { fill: 'white', 'font-size': 12} },
                         text: { fill: 'white', 'font-size': 12, lineHeight: '1.35em','ref-y': .55, ref: 'rect', 'y-alignment': 'middle'} },
                cplane_type : 'vm',
                site_name: '',
                vm_name: '',
                vm_uuid: '',
                vm_srId: ''
            }, joint.shapes.basic.Rect.prototype.defaults)
        });
        
        
        graphFactory.AddOpenStackSite = function(label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_site({ 
                position: node_position,
                attrs: {text: {text : label} },
                site_name : label 
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddOpenStackSubnet = function(site, label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_subnet({ 
                position: node_position,
                attrs: {text: {text : label} },
                site_name : site 
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddOpenStackOgr = function(site, node_position) {
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_ogr({ 
                position: node_position,
                site_name : site 
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddExternalSite = function(label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.External_site({ 
                position: node_position,
                attrs: {text: {text : label} },
                site_name : label 
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddConnectSite = function(label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Connect_site({ 
                position: node_position,
                attrs: {text: {text : label} }
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddVM = function(site, vm, uuid, srId, label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.VM({ 
                position: node_position,
                attrs: {text: {text : label} },
                site_name : site,
                vm_name: vm,
                vm_uuid: uuid,
                vm_srId: srId
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddLink = function(source_node, target_node) {
            //source_node : source_node_obj
            //target_node : target_node_obj
            var link = new joint.dia.Link({
                attrs : {'.connection' : {stroke : '#7F7F7F', 'stroke-width': 2}},
                source: { id: source_node.id },
                target: { id: target_node.id },
            });
            
            graphFactory.graph.addCells([link]);
            return link;
        };

		return graphFactory;
    };

    graphFactory.$inject = injectParams;

    app.factory('GraphService', graphFactory);

});