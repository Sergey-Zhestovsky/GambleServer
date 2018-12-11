;(function() {
    window.GlowingNodes = function GlowingNodes(options) {
        let wrapper, canvas, SENSITIVITY, SIBLINGS_LIMIT,
            DENSITY, NODES_QTY = 0,
            ANCHOR_LENGTH, MOUSE_RADIUS, SPEED,
            colorScheme;

        let ctx, circ, nodes, mouse;

        ({
            wrapper: wrapper,
            canvas: canvas,
            nodeConnectionDistance: SENSITIVITY = 100,
            sublingLimit: SIBLINGS_LIMIT = 10,
            nodeMargin: DENSITY = 65,
            nodeMaxSpread: ANCHOR_LENGTH = 50,
            visionRadious: MOUSE_RADIUS = 300,
            nodeSpeed: SPEED = 550,
            colorScheme: colorScheme = { node: `8, 6, 34`, connection: `8, 6, 34` },
            initialPosition: initialPosition = {}
        } = options);

        wrapper = document.querySelector(wrapper);
        canvas = document.querySelector(canvas);

        circ = 2 * Math.PI;
        nodes = [];

        resizeWindow();

        mouse = {
            x: initialPosition.x || undefined,
            y: initialPosition.y || undefined
        };
        ctx = canvas.getContext('2d');

        function Node(x, y) {
            this.anchorX = x;
            this.anchorY = y;
            this.x = Math.random() * (x - (x - ANCHOR_LENGTH)) + (x - ANCHOR_LENGTH);
            this.y = Math.random() * (y - (y - ANCHOR_LENGTH)) + (y - ANCHOR_LENGTH);
            this.vx = Math.random() * 2 - 1;
            this.vy = Math.random() * 2 - 1;
            this.energy = Math.random() * 100;
            this.radius = Math.random();
            this.siblings = [];
            this.brightness = 0;
        }

        Node.prototype.drawNode = function() {
            var color = `rgba(${colorScheme.node}, ` + this.brightness + ")";
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2 * this.radius + 2 * this.siblings.length / SIBLINGS_LIMIT, 0, circ);
            ctx.fillStyle = color;
            ctx.fill();
        };

        Node.prototype.drawConnections = function() {
            for (var i = 0; i < this.siblings.length; i++) {
                let dist = calcDistance(this, this.siblings[i]);

                if (dist > SENSITIVITY)
                    continue;

                let color = `rgba(${colorScheme.connection}, ` + this.brightness + ")";

                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.siblings[i].x, this.siblings[i].y);
                ctx.lineWidth = 1 - dist / SENSITIVITY;
                ctx.strokeStyle = color;
                ctx.stroke();
            }
        };

        Node.prototype.moveNode = function() {
            this.energy -= 1;
            if (this.energy < 1) {
                this.energy = Math.random() * 100;
                if (this.x - this.anchorX < -ANCHOR_LENGTH) {
                    this.vx = Math.random() * 2;
                } else if (this.x - this.anchorX > ANCHOR_LENGTH) {
                    this.vx = Math.random() * -2;
                } else {
                    this.vx = Math.random() * 4 - 2;
                }
                if (this.y - this.anchorY < -ANCHOR_LENGTH) {
                    this.vy = Math.random() * 2;
                } else if (this.y - this.anchorY > ANCHOR_LENGTH) {
                    this.vy = Math.random() * -2;
                } else {
                    this.vy = Math.random() * 4 - 2;
                }
            }
            this.x += this.vx * this.energy / SPEED;
            this.y += this.vy * this.energy / SPEED;
        };

        function initNodes() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            nodes = [];
            for (var i = DENSITY; i < canvas.width; i += DENSITY) {
                for (var j = DENSITY; j < canvas.height; j += DENSITY) {
                    nodes.push(new Node(i, j));
                    NODES_QTY++;
                }
            }
        }

        function calcDistance(node1, node2) {
            return Math.sqrt(Math.pow(node1.x - node2.x, 2) + (Math.pow(node1.y - node2.y, 2)));
        }

        function findSiblings() {
            var node1, node2, distance;
            for (var i = 0; i < NODES_QTY; i++) {
                node1 = nodes[i];
                node1.siblings = [];
                for (var j = 0; j < NODES_QTY; j++) {
                    node2 = nodes[j];
                    if (node1 !== node2) {
                        distance = calcDistance(node1, node2);
                        if (distance < SENSITIVITY) {
                            if (node1.siblings.length < SIBLINGS_LIMIT) {
                                node1.siblings.push(node2);
                            } else {
                                var node_sibling_distance = 0;
                                var max_distance = 0;
                                var s;
                                for (var k = 0; k < SIBLINGS_LIMIT; k++) {
                                    node_sibling_distance = calcDistance(node1, node1.siblings[k]);
                                    if (node_sibling_distance > max_distance) {
                                        max_distance = node_sibling_distance;
                                        s = k;
                                    }
                                }
                                if (distance < max_distance) {
                                    node1.siblings.splice(s, 1);
                                    node1.siblings.push(node2);
                                }
                            }
                        }
                    }
                }
            }
        }

        function redrawScene() {
            resizeWindow();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            findSiblings();
            var i, node, distance;
            for (i = 0; i < NODES_QTY; i++) {
                node = nodes[i];

                distance = calcDistance({
                    x: mouse.x,
                    y: mouse.y
                }, node);

                if (distance < MOUSE_RADIUS) {
                    node.brightness = 1 - distance / MOUSE_RADIUS;
                } else {
                    node.brightness = 0;
                }
            }
            for (i = 0; i < NODES_QTY; i++) {
                node = nodes[i];
                if (node.brightness) {
                    node.drawNode();
                    node.drawConnections();
                }
                node.moveNode();
            }
            requestAnimationFrame(redrawScene);
        }

        function initHandlers() {
            let lastScrolled = 0;

            document.addEventListener('resize', resizeWindow, false);
            wrapper.addEventListener('mousemove', mousemoveHandler, false);
            document.addEventListener("scroll", function(e) {
                if (lastScrolled != 0 && lastScrolled != window.scrollY) {
                    mouse.y += window.scrollY - lastScrolled;
                }
                lastScrolled = window.scrollY;
            }, true);
        }

        function resizeWindow() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function mousemoveHandler(e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY + window.scrollY;
        }

        initHandlers();
        initNodes();
        redrawScene();

    }
})();