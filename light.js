var app = app || {};

app.Light = function() {

	//constructor for light
	function Light(_brightness) {
		this.brightness = _brightness;
		this.pos = new Victor(Math.floor(Math.random() * (window.innerWidth - this.brightness)), Math.floor(Math.random() * (window.innerHeight*.988 - this.brightness)));
		this.moving = false;
	};
	
	var l = Light.prototype;
	
	//draws the light to the canvas
	l.display = function(ctx) {
		ctx.save();
		ctx.fillStyle = "rgba(255,215,0,.5)";//"gold";
		ctx.strokeStyle = "rgba(218,165,32,.5)"//"goldenrod";
		
		ctx.beginPath();
		ctx.arc(this.pos.x,this.pos.y,this.brightness,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
		
		ctx.restore();
	}
	
	//moves the light to the mouse location
	l.moveLight = function(mouse){
		this.pos.x = mouse.x;
		this.pos.y = mouse.y;
	}
	
	return Light;
	
}();