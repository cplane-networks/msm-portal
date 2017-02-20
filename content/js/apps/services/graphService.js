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
            gridSize: 1,
            linkPinning: false,
            linkConnectionPoint: function(linkView, elementView, magnet, reference) {
                var element = elementView.model;
                var connection_point = null;
                try{
                    connection_point = element.getConnectionPoint(reference);
                }
                catch(e){
                    //e
                }
                if (connection_point == null){
                    connection_point = element.getBBox().center()
                }    
                return connection_point;
            }
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
				var content = '<span>VM: '+cellView.attributes.vm_name+'<br/>UUID: '+cellView.attributes.vm_uuid+'<br/>Image: '+vm_details.imageRef+'<br/>Flavor: '+vm_details.flavorRef;
                
                /* Update content of the tooltip for new subnets */
                angular.forEach(vm_details.addresses, function(network, index) {
                    if (network.subnet_type == "backbone"){
                        content += '<br/>Backbone IP: '+network.fixedIP.ip;
                    }
                    else if (network.subnet_type == "internal_resources"){
                        content += '<br/>Internal IP: '+network.fixedIP.ip;
                    }    
                    else if (network.subnet_type == "floatingip"){
                        content += '<br/>GIA Fixed IP: '+network.fixedIP.ip;
                        content += '<br/>GIA Floating IP: '+network.floatingIP.ip;
                        content += '<br/>Floating IP Quota: '+(network.floatingIP.quota ? network.floatingIP.quota : 'None');
                    }
                });
                
                content += '</span>';
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
                    $rootScope.notification = "Starting VM..."
                    $injector.get('MSMService')['StartVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Stop":
                    $rootScope.notification = "Stopping VM..."
                    $injector.get('MSMService')['StopVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Reboot":
                    $rootScope.notification = "Rebooting VM..."
                    $injector.get('MSMService')['RebootVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Delete":
                    $rootScope.notification = "Deleting VM..."
                    $injector.get('MSMService')['DeleteVM']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
                case "Console":
                    $rootScope.notification = "Opening VM Console..."
                    graphFactory.paper.findViewByModel(cellView).options.interactive = true;
                    $injector.get('MSMService')['getVMConsole']($rootScope, customer_name, site_name, vm_name, vm_uuid, vm_srId);
                    break;
            }
            
            rightClickedCell = null;
        });
        
        //Scale Graph
        graphFactory.zoomValue = AppConfig.default_zoom;
        graphFactory.paper.$el.on('mousewheel DOMMouseScroll', function (e) {

            e.preventDefault();
            e = e.originalEvent;
            var offsetX = (e.offsetX || e.clientX - $(this).offset().left);
            var offsetY = (e.offsetY || e.clientY - $(this).offset().top);
            var p = clientToLocalPoint({
                x: offsetX,
                y: offsetY
            });
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            var currentScale = V(graphFactory.paper.viewport).scale().sx;
            var newScale = currentScale + delta / 100;
            
            graphFactory.zoomValue = Math.floor((currentScale * 100) + delta);
            graphFactory.scaleGraph(offsetX, offsetY, newScale);
            $rootScope.$broadcast('mouseZoomEvent', graphFactory.zoomValue);
        });
        
        graphFactory.scaleGraph = function(offsetX, offsetY, newScale){
            if (newScale > (AppConfig.min_zoom / 100) && newScale < (AppConfig.max_zoom / 100)) {
                graphFactory.paper.scale(newScale, newScale);
                
                /* Remove pointer location origin */
                //graphFactory.paper.setOrigin(20, 20);
                //graphFactory.paper.scale(newScale, newScale, offsetX, offsetY);
            }
        }

        // Transform client coordinates to the paper local coordinates.
        // Useful when you have a mouse event object and you'd like to get coordinates
        // inside the paper that correspond to `evt.clientX` and `evt.clientY` point.
        // Exmaple: var paperPoint = paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
        function clientToLocalPoint(p) {

            var svgPoint = graphFactory.paper.svg.createSVGPoint();
            svgPoint.x = p.x;
            svgPoint.y = p.y;

            // This is a hack for Firefox! If there wasn't a fake (non-visible) rectangle covering the
            // whole SVG area, `$(paper.svg).offset()` used below won't work.
            var fakeRect = V('rect', {
                width: graphFactory.paper.options.width,
                height: graphFactory.paper.options.height,
                x: 0,
                y: 0,
                opacity: 0
            });
            V(graphFactory.paper.svg).prepend(fakeRect);

            var paperOffset = $(graphFactory.paper.svg).offset();

            // Clean up the fake rectangle once we have the offset of the SVG document.
            fakeRect.remove();

            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;

            svgPoint.x += scrollLeft - paperOffset.left;
            svgPoint.y += scrollTop - paperOffset.top;

            // Transform point into the viewport coordinate system.
            var pointTransformed = svgPoint.matrixTransform(graphFactory.paper.viewport.getCTM().inverse());

            return pointTransformed;
        }
        
        //Drag Graph
        var dragStartPosition = null;
        graphFactory.paper.on('blank:pointerdown',
            function(event, x, y) {
                var scale = V(graphFactory.paper.viewport).scale();
                dragStartPosition = { x: x * scale.sx, y: y * scale.sy};
                graphFactory.paper.$el.addClass('connecting');
            }
        );
        
        graphFactory.paper.on('cell:pointerup blank:pointerup', function(cellView, x, y) {
            dragStartPosition = null;
            graphFactory.paper.$el.removeClass('connecting');
        });
        
        $(".paper").mousemove(function(event) {
            if (dragStartPosition != null){
                var x = event.offsetX - dragStartPosition.x;
                var y = event.offsetY - dragStartPosition.y;
                /*
                if (x > 0 && y > 0){
                    graphFactory.paper.setOrigin( x, y );
                }    
                */
                graphFactory.paper.setOrigin( x, y);
            }    
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
                attrs: { ellipse: { stroke: '#f4b183', 'stroke-width': 1.5 }, 
                         //text: { fill: 'black', 'font-size': 12} },
                         text: { fill: 'black', 'font-size': 11, 'ref-y': .55, ref: 'ellipse', 'y-alignment': 'middle'} },
                cplane_type : 'openstack_subnet',
                site_name : ''
            }, joint.shapes.basic.Ellipse.prototype.defaults)
        });
        
        joint.shapes.basic.Openstack_internal_subnet = joint.shapes.basic.Ellipse.extend({
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_internal_subnet',
                size: { width: 100, height: 40 },
                attrs: { ellipse: { stroke: '#7030a0', 'stroke-width': 1.5, 'stroke-dasharray': '2,1' }, 
                         //text: { fill: 'black', 'font-size': 12} },
                         text: { fill: 'black', 'font-size': 11, 'ref-y': .55, ref: 'ellipse', 'y-alignment': 'middle'} },
                cplane_type : 'openstack_internal_subnet',
                site_name : ''
            }, joint.shapes.basic.Ellipse.prototype.defaults)
        });
        
        joint.shapes.basic.Openstack_fip_subnet = joint.shapes.basic.Ellipse.extend({
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_fip_subnet',
                size: { width: 100, height: 40 },
                attrs: { ellipse: { stroke: '#7f7f7f', 'stroke-width': 1.5, 'stroke-dasharray': '2,1' }, 
                         //text: { fill: 'black', 'font-size': 12} },
                         text: { fill: 'black', 'font-size': 11, 'ref-y': .55, ref: 'ellipse', 'y-alignment': 'middle'} },
                cplane_type : 'openstack_fip_subnet',
                site_name : ''
            }, joint.shapes.basic.Ellipse.prototype.defaults)
        });
        
        joint.shapes.basic.Openstack_internet_cloud = joint.shapes.basic.Generic.extend({
            markup: '<g class="rotatable"><g class="scalable"><image/></g></g><text/>',
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_internet_cloud',
                size: {width: 100, height: 40},
                attrs: {
                    image: {
                        'width': 100, 'height': 40,
                        'xlink:href': AppConfig.SVGIconPath + 'Internet Cloud.svg'
                    }
                },
                cplane_type : 'openstack_internet_cloud',
                site_name : ''
            }, joint.shapes.basic.Generic.prototype.defaults)
        });
        
        joint.shapes.basic.Openstack_wan_cloud = joint.shapes.basic.Generic.extend({
            markup: '<g class="rotatable"><g class="scalable"><image/></g></g><text/>',
            defaults: joint.util.deepSupplement({
                type: 'basic.Openstack_wan_cloud',
                size: {width: 100, height: 40},
                attrs: {
                    image: {
                        'width': 100, 'height': 40,
                        'xlink:href': AppConfig.SVGIconPath + 'WAN Cloud.svg'
                    }
                },
                cplane_type : 'openstack_wan_cloud'
            }, joint.shapes.basic.Generic.prototype.defaults)
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
                         text: { fill: 'black', 'font-size': 12, 'ref-y': .55, ref: 'ellipse', 'y-alignment': 'middle'} },
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
        
        
        graphFactory.AddOpenStackSite = function(label, node_position, label_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_site({ 
                position: node_position,
                attrs: {text: {text : label, 'ref-y' : label_position == 'top' ? -1 : 110} },
                site_name : label 
            });
            
            graphFactory.graph.addCells([node]);
            //graphFactory.paper.scaleContentToFit();
            //graphFactory.scaleGraph(0,0,.7);
            return node;
        };
        
        graphFactory.AddOpenStackSubnet = function(site, label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_subnet({ 
                position: node_position,
                attrs: {text: {text : label + "\n(Backbone)"} },
                site_name : site 
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddOpenStackInternalSubnet = function(site, label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_internal_subnet({ 
                position: node_position,
                attrs: {text: {text : label + "\n(Internal)"} },
                site_name : site 
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddOpenStackFipSubnet = function(site, label, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_fip_subnet({ 
                position: node_position,
                attrs: {text: {text : label+ "\n(Floating IP)"} },
                site_name : site 
            });
            
            graphFactory.graph.addCells([node]);
            return node;
        };
        
        graphFactory.AddOpenStackInternetCloud = function(site, node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_internet_cloud({ 
                position: node_position,
                site_name : site 
            });
            
            graphFactory.graph.addCells([node]);
            //graphFactory.paper.scaleContentToFit();
            return node;
        };
        
        graphFactory.AddOpenStackWanCloud = function(node_position) {
            //label : <string>
            //node_position : {x: <integer>, y: <integer>}
            var node = new joint.shapes.basic.Openstack_wan_cloud({ 
                position: node_position
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
            //graphFactory.paper.scaleContentToFit();
            return node;
        };
        
        graphFactory.AddLink = function(source_node, target_node, connection_type) {
            
            //source_node : source_node_obj
            //target_node : target_node_obj
            
            var color_map = {"external_site" : "#0f75bc",
                             "ogr" : "#7F7F7F",
                             "backbone" : "#f4b183",
                             "vm" : "#548235",
                             "internal" : "#7030a0",
                             "fip" : "#7f7f7f"}
            var link = new joint.dia.Link({
                attrs : {'.connection' : {stroke : color_map[connection_type], 'stroke-width': 2, 'stroke-dasharray': connection_type == 'vm' ? '5 2' : ''}},
                source: { id: source_node.id },
                target: { id: target_node.id },
            });
            
            graphFactory.graph.addCells([link]);
            link.toBack();
            return link;
        };

		return graphFactory;
    };

    graphFactory.$inject = injectParams;

    app.factory('GraphService', graphFactory);

});