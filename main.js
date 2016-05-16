"use strict";
//make sure to download victor.js library and dat.gui.js!
var app = app || {};

window.onload = function() {
	console.log("window loaded");
	app.main.init();
};


app.main = {
	
	//Variables
	vCanvas: undefined,		//the canvas for vehicles and lights
	drawCanvas: undefined,	//the image canvas that will be drawn to
	ctx: undefined,			//context for vCanvas
	drawCtx: undefined,		//context for drawCanvas
	vehicles: undefined,	//array of vehicles for the sim
	lights: undefined,		//array of lights for the sim
	gui: undefined,			//the gui used for the menu
	Dimness: 0.1,			//the dimness var used for the opacity fo the draw canvass' background color
	topHidden: false,		//bool for toggling hiding the vCanvas so that the draw canvas can eb seen on its own
	AttractVehicleColor: "#800080",		//color for the attract vehicle
	RepelVehicleColor: "#ff0000",		//color for the repel vehicle
	RepelVehicleTrail: [255, 155, 0, .1],	//color for the repel vehicle's trail
	AttractVehicleTrail: [0, 0, 0, .1],		//color for the attract vehicle's trail
	f2: undefined,			//folder for gui to hold light stuff
	f3: undefined,			//folder for gui to hold light array
	lightFolders: undefined,	//array of all of the folders of individual lights
	
	
	//initializer function
	init: function() {
		//sets up canvasses
		app.main.vCanvas = document.getElementById("topCanvas");
		app.main.vCanvas.width = window.innerWidth;
		app.main.vCanvas.height = window.innerHeight*.988;
		app.main.ctx = app.main.vCanvas.getContext('2d');
		
		app.main.drawCanvas = document.getElementById("drawCanvas");
		app.main.drawCanvas.width = app.main.vCanvas.width;
		app.main.drawCanvas.height = app.main.vCanvas.height;
		app.main.drawCtx = app.main.drawCanvas.getContext('2d');
		
		//sets yup mouse event listeners
		app.main.vCanvas.onmousedown = app.main.doMouseDown;
		app.main.vCanvas.onmouseup = app.main.doMouseUp;
		app.main.vCanvas.onmousemove = app.main.doMouseMove;
		
		//sets up vehicles
		app.main.vehicles = [];
		
		app.main.vehicles.push(new app.Vehicle(true));
		app.main.vehicles.push(new app.Vehicle(false));
		
		//sets up default lights
		app.main.lights = [];
		
		for(var i = 0; i < 20; i++)
		{
			app.main.lights.push(new app.Light(40));
		}
		
		//sets up the gui menu
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
		
		//sets up update to repeat at a 30fps rate
		setInterval(app.main.update, 1000/30);
	},
	
	
	//main loop function
	update: function() {
		
		//clears the vehcile canvas
		app.main.ctx.clearRect(0,0, app.main.vCanvas.width, app.main.vCanvas.height);
		
		//draws the lights
		for(var i = 0; i < app.main.lights.length; i++)
		{
			app.main.lights[i].display(app.main.ctx);
		}
		
		//rounds all of the rgb values for the color trail becaus dat.gui gives them weird decimals for some reason
		for(var i = 0; i < app.main.AttractVehicleTrail.length-1; i++)
			app.main.AttractVehicleTrail[i] = Math.floor(app.main.AttractVehicleTrail[i]);
		for(var i = 0; i < app.main.RepelVehicleTrail.length-1; i++)
			app.main.RepelVehicleTrail[i] = Math.round(app.main.RepelVehicleTrail[i]);
		
		//updates the vehicles
		for(var i = 0; i < app.main.vehicles.length; i++)
		{
			app.main.vehicles[i].update(app.main.lights, app.main.ctx, app.main.drawCtx, app.main.AttractVehicleColor, app.main.AttractVehicleTrail, app.main.RepelVehicleColor, app.main.RepelVehicleTrail);
		}
		
		//sets the draw canvasses backgroound color every update in case of changes
		document.getElementById('drawCanvas').style.background = "rgba(255,255,255,"+app.main.Dimness+")";
		
	},
	
	//the onmousedown event listener
	//begins the process of moving a light if it's selected
	doMouseDown: function(e) {
	
		var mouseX = e.pageX - e.target.offsetLeft;
		var mouseY = e.pageY - e.target.offsetTop;
		
		for(var i = 0; i < app.main.lights.length; i++)
		{
			if(mouseX > app.main.lights[i].pos.x -  app.main.lights[i].brightness/2 && mouseX <  app.main.lights[i].pos.x + app.main.lights[i].brightness/2 && mouseY > app.main.lights[i].pos.y - app.main.lights[i].brightness/2 && mouseY < app.main.lights[i].pos.y + app.main.lights[i].brightness/2)
				app.main.lights[i].moving = true;
		}
	},
	
	
	//the onmouseup event listener
	//ends the process of moving a light if the user was moving one
	doMouseUp: function(e) {
		for(var i = 0; i < app.main.lights.length; i++)
		{
			app.main.lights[i].moving = false;
		}
	},
	
	//the onmousemove event listener
	//moves the ligth if the user is in the act of moving one
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
	
	//adds a light to the light array on the screen and adds a sub menu for it
	AddLight: function() {
		app.main.lights.push(new app.Light(40));
		
		app.main.lightFolders.push(app.main.f3.addFolder('Light '+(app.main.lightFolders.length+1)));
		app.main.lightFolders[app.main.lightFolders.length-1].add(app.main.lights[app.main.lights.length-1], 'brightness',5,100).step(5);
	},
	
	//toggles wheteher or not the vaheicle canvas is shown oon the screen
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

