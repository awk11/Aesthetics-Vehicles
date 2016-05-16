"use strict";

var app = app || {};

window.onload = function() {
	console.log("window loaded");
	app.main.init();
};


app.main = {
	vCanvas: undefined,
	drawCanvas: undefined,
	ctx: undefined,
	drawCtx: undefined,
	vehicles: undefined,
	lights: undefined,
	gui: undefined,
	Dimness: 0.1,
	topHidden: false,
	AttractVehicleColor: "#800080",
	RepelVehicleColor: "#ff0000",
	RepelVehicleTrail: [255, 155, 0, .1],
	AttractVehicleTrail: [0, 0, 0, .1],
	f2: undefined,
	f3: undefined,
	lightFolders: undefined,
	
	
	init: function() {
		app.main.vCanvas = document.getElementById("topCanvas");
		app.main.vCanvas.width = window.innerWidth;
		app.main.vCanvas.height = window.innerHeight*.988;
		app.main.ctx = app.main.vCanvas.getContext('2d');
		
		app.main.drawCanvas = document.getElementById("drawCanvas");
		app.main.drawCanvas.width = app.main.vCanvas.width;
		app.main.drawCanvas.height = app.main.vCanvas.height;
		app.main.drawCtx = app.main.drawCanvas.getContext('2d');
		
		app.main.vCanvas.onmousedown = app.main.doMouseDown;
		app.main.vCanvas.onmouseup = app.main.doMouseUp;
		app.main.vCanvas.onmousemove = app.main.doMouseMove;
		
		app.main.vehicles = [];
		
		app.main.vehicles.push(new app.Vehicle(true));
		app.main.vehicles.push(new app.Vehicle(false));
		
		app.main.lights = [];
		
		for(var i = 0; i < 20; i++)
		{
			app.main.lights.push(new app.Light(40));
		}
		
		app.main.gui = new dat.GUI();
		app.main.gui.add(app.main, 'Dimness', 0, 1).step(0.1);
		app.main.gui.add(app.main, 'ToggleVehicles');
		var f1 = app.main.gui.addFolder('Vehicle Settings');
		f1.addColor(app.main, "AttractVehicleColor");
		f1.addColor(app.main, "AttractVehicleTrail");
		f1.addColor(app.main, "RepelVehicleColor");
		f1.addColor(app.main, "RepelVehicleTrail");
		
		app.main.f2 = app.main.gui.addFolder('Lights Settings');
		app.main.f3 = app.main.f2.addFolder('Light Array');
		app.main.f2.add(app.main, 'AddLight');
		
		app.main.lightFolders = [];
		for(var i = 0; i < app.main.lights.length; i++)
		{
			app.main.lightFolders.push(app.main.f3.addFolder('Light '+(i+1)));
			app.main.lightFolders[i].add(app.main.lights[i], 'brightness',0,100).step(5);
		}
		
		setInterval(app.main.update, 1000/30);
	},
	
	update: function() {
		
		app.main.ctx.clearRect(0,0, app.main.vCanvas.width, app.main.vCanvas.height);
		
		for(var i = 0; i < app.main.lights.length; i++)
		{
			app.main.lights[i].display(app.main.ctx);
		}
		
		for(var i = 0; i < app.main.AttractVehicleTrail.length-1; i++)
			app.main.AttractVehicleTrail[i] = Math.floor(app.main.AttractVehicleTrail[i]);
		for(var i = 0; i < app.main.RepelVehicleTrail.length-1; i++)
			app.main.RepelVehicleTrail[i] = Math.round(app.main.RepelVehicleTrail[i]);
		
		for(var i = 0; i < app.main.vehicles.length; i++)
		{
			app.main.vehicles[i].update(app.main.lights, app.main.ctx, app.main.drawCtx, app.main.AttractVehicleColor, app.main.AttractVehicleTrail, app.main.RepelVehicleColor, app.main.RepelVehicleTrail);
		}
		
		document.getElementById('drawCanvas').style.background = "rgba(255,255,255,"+app.main.Dimness+")";
		
	},
	
	doMouseDown: function(e) {
	
		var mouseX = e.pageX - e.target.offsetLeft;
		var mouseY = e.pageY - e.target.offsetTop;
		
		for(var i = 0; i < app.main.lights.length; i++)
		{
			if(mouseX > app.main.lights[i].pos.x -  app.main.lights[i].brightness/2 && mouseX <  app.main.lights[i].pos.x + app.main.lights[i].brightness/2 && mouseY > app.main.lights[i].pos.y - app.main.lights[i].brightness/2 && mouseY < app.main.lights[i].pos.y + app.main.lights[i].brightness/2)
				app.main.lights[i].moving = true;
		}
	},

	doMouseUp: function(e) {
		for(var i = 0; i < app.main.lights.length; i++)
		{
			app.main.lights[i].moving = false;
		}
	},
	
	doMouseMove: function(e) {
	
		var mouse = {}
		mouse.x = e.pageX - e.target.offsetLeft;
		mouse.y = e.pageY - e.target.offsetTop;
		
		for(var i = 0; i < app.main.lights.length; i++)
		{
			if(app.main.lights[i].moving)
			{
				app.main.lights[i].moveLight(mouse);
			}
		}
	},
	
	AddLight: function() {
		app.main.lights.push(new app.Light(40));
		
		app.main.lightFolders.push(app.main.f3.addFolder('Light '+(app.main.lightFolders.length+1)));
		app.main.lightFolders[app.main.lightFolders.length-1].add(app.main.lights[app.main.lights.length-1], 'brightness',5,100).step(5);
	},
	
	ToggleVehicles: function() {
		if(app.main.topHidden)
		{
			app.main.topHidden = false;
			app.main.vCanvas.style.visibility = "visible";
		}
		else
		{
			app.main.topHidden = true;
			app.main.vCanvas.style.visibility = "hidden";
		}
	},
	
};

