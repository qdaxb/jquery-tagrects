(function($) {
    var rects = new Array();
	jQuery.fn.extend({
        tagrects: function(options) {
            var defaults = {
                bold: true,
                rotate: true,
                size: {
                    width: $(document).width(),
                    height: $(document).height()
                }
            };
            var opts = $.extend(defaults, options);
            var optrects = opts.rects;
            var tagContainer = opts.tagContainer;
            var nodes = {};

            for (var i = 0; i < opts.rects.length; i++) {
                var rect = {};
                rect.start = optrects[i][0];
                rect.start.x = rect.start[0];
                rect.start.y = rect.start[1];
                rect.end = optrects[i][1];
                rect.end.x = rect.end[0];
                rect.end.y = rect.end[1];
                rect.height = optrects[i][2];
                addRect(this, rect.start, rect.end, rect.height, opts.size);
            }
            for (var i = 0; i < rects.length; i++) {
                nodes[i] = {
                    top: 0,
                    left: 0,
                    width: rects[i].width,
                    height: rects[i].height,
                    mostRight: true,
                    next: null,
                    previous: null
                };
            }
            $(tagContainer).children().each(function() {
                $(this).css({
                    'position': 'fixed'
                });
                var flag = false;
                for (var i = 0; i < rects.length; i++) {
                    var ran = parseInt(Math.random() * rects.length);
                    $(this).appendTo($('.tagRect')[ran]);
                    if (!tryPlace($('.tagRect')[ran], nodes[ran], this)) continue;
                    flag = true;
                    break;
                }
                if (!flag) $(this).css({
                    'display': 'none'
                });
            });
            if (opts.bold) $('.tagRect').children().mouseover(function() {
                $(this).css({
                    'font-weight': 'bold'
                });
            }).mouseout(function() {
                $(this).css({
                    'font-weight': 'normal'
                });
            });
            if (opts.rotate && $.fn.rotate) $('.tagRect').children().rotate({
                bind: {
                    mouseover: function() {
                        $(this).rotate({
                            animateTo: -$(this).parent().attr('rotate')
                        })
                    },
                    mouseout: function() {
                        $(this).rotate({
                            animateTo: 0
                        })
                    }
                }

            });

        }
    });
    function beenPlace(parent, widget, top, left, bottom, right) {
        var flag = false;
        if (right > parent.offsetWidth) return true;
        $(parent).children().each(function() {
            if (this == widget) return;
            if (! ((left > (this.offsetLeft + this.offsetWidth)) || (right < this.offsetLeft) || (bottom < (this.offsetTop)) || (top > (this.offsetTop + this.offsetHeight)))) flag = true;
        });
        return flag;

    }
    function place(widget, top, left) {
        widget.style.top = top + "px";
        widget.style.left = left + "px";
    }
    function insertPlaceNode(headPlaceNode, top, left, width, height) {
        var placeNode = headPlaceNode;
        while (placeNode) {
            if ((! (placeNode.next)) || (placeNode.next.height < height)) {
                var newNode = {
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    mostRight: false,
                    next: placeNode.next,
                    previous: placeNode
                };
                if (placeNode.next) placeNode.next.previous = newNode;
                placeNode.next = newNode;
                return;
            }
            placeNode = placeNode.next;
        }
    }
    function updatePlaceNode(parent, widget, headPlaceNode, currentNode, top, left, width, height) {
        if (currentNode.mostRight) {
            currentNode.left = left + width + 1;
            currentNode.width = parent.clientWidth - left - width - 1;
        } else {
            if (currentNode.previous != null) currentNode.previous.next = currentNode.next;
            if (currentNode.next != null) currentNode.next.previous = currentNode.previous;

            insertPlaceNode(headPlaceNode, currentNode.top, left + width + 1, currentNode.width + currentNode.left - left - width, currentNode.height);
        }
        insertPlaceNode(headPlaceNode, 0, left, width, top);
        insertPlaceNode(headPlaceNode, top + height + 1, left, width, parent.clientHeight - height - top);

    }
    function tryPlace(parent, headPlaceNode, widget) {
        var placeNode = headPlaceNode;
        while (placeNode != null) {
            if (widget.clientHeight > placeNode.height) {
                placeNode = placeNode.next;
                continue;
            }
            if (placeNode.mostRight) {
                if (placeNode.width < widget.clientWidth) {
                    placeNode = placeNode.next;
                    continue;
                }
            }
            if (!beenPlace(parent, widget, placeNode.top, placeNode.left, widget.clientHeight + placeNode.top, widget.clientWidth + placeNode.left)) {
                for (var i = 0; i < 10; i++) {
                    var tryTop = Math.random() * (placeNode.height - widget.clientHeight) + placeNode.top;
                    var tryLeft = Math.random() * 3 + placeNode.left;
                    if (!beenPlace(parent, widget, tryTop, tryLeft, widget.clientHeight + placeNode.top, widget.clientWidth + placeNode.left)) {
                        place(widget, tryTop, tryLeft);
                        updatePlaceNode(parent, widget, headPlaceNode, placeNode, widget.offsetTop, widget.offsetLeft, widget.clientWidth, widget.clientHeight);
						return true;
                    } else continue;
                }
                place(widget, placeNode.top, placeNode.left);
                updatePlaceNode(parent, widget, headPlaceNode, placeNode, placeNode.top, placeNode.left, widget.clientWidth, widget.clientHeight);
                return true;
            }
            placeNode = placeNode.next;
        }
        return false;
    }

    function addRect(parent, startPoint, endPoint, height, definedSize) {
        var wwidth = $(parent).width();
        var wheight = $(parent).height();
        //adjust real points
        startPoint.x = startPoint.x / definedSize[0] * wwidth;
        startPoint.y = startPoint.y / definedSize[1] * wheight;
        endPoint.x = endPoint.x / definedSize[0] * wwidth;
        endPoint.y = endPoint.y / definedSize[1] * wheight;
        //calucate edge length and angle
        var edgeX, edgeY, edgeZ, angle;
        edgeX = endPoint.x - startPoint.x;
        edgeY = endPoint.y - startPoint.y;
        edgeZ = Math.sqrt(Math.pow(Math.abs(edgeX), 2) + Math.pow(Math.abs(edgeY), 2));
        var radina = Math.atan(edgeY / edgeX);
        angle = 180 / (Math.PI / radina);
        var widget = $('<div></div>');
        widget.addClass('tagRect');
        var top = (endPoint.y + startPoint.y) / 2;
        var left = ((endPoint.x + startPoint.x) - edgeZ) / 2;
        widget.css({
            'top': top + 'px',
            'left': left + 'px',
            'height': height + 'px',
            'width': edgeZ + 'px',
            'line-height': '1',
            "-moz-transform": "rotate(" + angle + "deg)",
            "-webkit-transform": "rotate(" + angle + "deg)",
            "-o-transform": "rotate(" + angle + "deg)",
            "-ms-transform": "rotate(" + angle + "deg)",
            'position': 'fixed'
        });
        $(parent).append(widget);
        widget.attr('rotate', angle);
        rects[rects.length] = {
            top: top,
            left: left,
            width: edgeZ,
            height: 30,
            angle: -50
        };
    }

})(jQuery);