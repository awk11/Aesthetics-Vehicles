var app = app || {};

app.Vehicle = function() {
	
	//constructor function
	function Vehicle(_type) {
		//the type of vehicle
		//true means its an attracting vehicle
		//false means it's a repelling vehicle
		this.type = _type;
		
		//starts the vehicle center screen
		this.pos = new Victor(window.innerWidth / 2, window.innerHeight*.988 /2);
		
		//the velocity of the vehicle
		this.velocity = new Victor(0, -1);
		
		//the ehicle's acceleration
		this.acceleration = new Victor(0,0);
		this.acceleration.x = 0;
		this.acceleration.y = 0;
		
		//the move direction
		this.moveDir = new Victor(0,0);
		
		//the position of the left controller
		this.posLC = new Victor(this.pos.x - 15, this.pos.y - 15);
		
		//the position of the right controller
		this.posRC = new Victor(this.pos.x + 15, this.pos.y - 15);
		
		//the vehicle's rotation
		this.rotation = 0;
		
		//the forces acting on the vehicle
		this.leftForce = new Victor(0,0);
		this.rightForce = new Victor(0,0);
		
		//initial uncalculated forces on the vehicle
		this.leftLightForce = 0;
		this.rightLightForce = 0;
		
		//the last position of the vehicle (used for drawing trails)
		this.lastPos = this.pos.clone();
	};
	
	var v = Vehicle.prototype;
	
	//the update function
	//updates all logic for the vehciel as well as displays it
	//params
	//Lights: the array of lights in the simulation
	//ctx: the vehjicle canvcas context
	//dctx: the trail canvas context
	//AttractVehicleColor: the color of the attract vehicle
	//AttractVehicleTrail: the color of the attract vehicle's trail
	//RepelVehicleColor: the color of the repel vehicle
	//RepelVehicleTrail: the color of the repel vehicle's trail
	v.update = function(Lights, ctx, dctx, AttractVehicleColor, AttractVehicleTrail, RepelVehicleColor, RepelVehicleTrail) {
		
		//resets params
		this.leftLightForce = 0;
		this.rightLightForce = 0;
		var ltemp, rtemp;
		this.lastPos = this.pos.clone();
		
		//gets inital ligth forces based on light array
		for(var i = 0; i < Lights.length; i++)
		{
			ltemp = (Lights[i].brightness) / (Lights[i].pos.distance(this.posLC));
			rtemp = (Lights[i].brightness) / (Lights[i].pos.distance(this.posRC));
			if(Math.abs(ltemp) > Math.abs(rtemp))
				this.leftLightForce += (ltemp);
			else
				this.rightLightForce += (rtemp);
		}
		
		
		
		//gets the offsets for everything in the vehicle
		var fwdOff = this.velocity.clone();
		fwdOff.normalize();
		fwdOff.multiply(new Victor(12,12));
		
		var leftOff = new Victor(this.velocity.y, this.velocity.x * -1);
		leftOff.normalize();
		leftOff.multiply(new Victor(10,10));
		
		var rightOff = new Victor(this.velocity.y * -1, this.velocity.x);
		rightOff.normalize();
		rightOff.multiply(new Victor(10,10));
		
		
		this.posLC = this.pos.clone();
		this.posLC.add(fwdOff);
		this.posLC.add(leftOff);
		
		this.posRC = this.pos.clone();
		this.posRC.add(fwdOff);
		this.posRC.add(rightOff);
		
		
		//calcs forces depending on the vehicle type
		if(!this.type)
		{
			this.leftForce = this.velocity.clone();
			this.leftForce.normalize();
			this.leftForce.multiply(new Victor(this.leftLightForce, this.leftLightForce));
			
			this.rightForce = this.velocity.clone();
			this.rightForce.normalize();
			this.rightForce.multiply(new Victor(this.rightLightForce, this.rightLightForce));
		}
		else
		{
			this.leftForce = this.velocity.clone();
			this.leftForce.normalize();
			this.leftForce.multiply(new Victor(this.rightLightForce, this.rightLightForce));
			
			this.rightForce = this.velocity.clone();
			this.rightForce.normalize();
			this.rightForce.multiply(new Victor(this.leftLightForce, this.leftLightForce));
		}
		
		//determines which way the vehicle will move
		var leftLine = this.posLC.clone();
		leftLine.add(this.leftForce);
		
		var rightLine = this.posRC.clone();
		rightLine.add(this.rightForce);
		
		var moveDirTemp = leftLine.clone();
		moveDirTemp.subtract(rightLine);
		moveDir = new Victor(moveDirTemp.y*-1, moveDirTemp.x);
		moveDir.normalize();
		
		//sets up vehicles acceleration
		this.acceleration.multiply(new Victor(0,0));
		this.acceleration = moveDir.clone();
		this.acceleration.multiply(new Victor(this.rightLightForce + this.leftLightForce, this.leftLightForce + this.rightLightForce));
		
		var temp = this.velocity.clone();
		temp.normalize();
		
		//adds friction
		if(Math.abs(temp.x) > .1 || Math.abs(temp.y) > .1)
		{
			var friction = this.velocity.clone();
			friction.multiply(new Victor(-1,-1));
			friction.normalize();
			friction.multiply(new Victor(.15,.15));
			this.acceleration.add(friction);
		}
		
		//updates the velocity
		this.velocity.add(this.acceleration);
		
		//limits the veklocity of a vehicle at an upper cap of 7
		if(this.velocity.length() > 7)
		{
			this.velocity.normalize();
			this.velocity.multiply(new Victor(7,7));
		}
		
		//sets up the rotation for the vehicle
		this.rotation = this.velocity.angle();
		this.pos.add(this.velocity);
		
		//determines if the vehicle just wrapped around the screen and wraps it if needed
		var wrapped = false;
		if(this.pos.x < 0) 
		{
			this.pos.x = window.innerWidth;
			wrapped = true;
		}
		if(this.pos.x > window.innerWidth)
		{
			this.pos.x = 0;
			wrapped = true;
		}
		if(this.pos.y < 0)
		{
			this.pos.y = window.innerHeight * .988;
			wrapped = true;
		}
		if(this.pos.y > window.innerHeight * .988)
		{
			this.pos.y = 0;
			wrapped = true;
		}
		
		
		//draws the vehicle trail unless it just wrapped from one side of the screen to the other
		if(!wrapped)
		{
			dctx.save();
			dctx.lineWidth = 8;
			if(!this.type)
				dctx.strokeStyle = "rgba("+RepelVehicleTrail+")";
			else
				dctx.strokeStyle = "rgba("+AttractVehicleTrail+")";
			dctx.beginPath();
			dctx.moveTo(this.lastPos.x, this.lastPos.y);
			dctx.lineTo(this.pos.x, this.pos.y);
			dctx.stroke();
			dctx.closePath();
			dctx.restore();
		}
			
			
		//draws the vehicle
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(this.rotation+Math.PI/2);
		if(this.type)
			ctx.fillStyle = AttractVehicleColor;
		else
			ctx.fillStyle = RepelVehicleColor;
		
		ctx.fillRect(-10, -12, 20, 24);
		ctx.restore();

		ctx.fillStyle = "black";
		
		//draws the left and right controllersa s dots
		ctx.beginPath();
		ctx.arc(this.posLC.x,this.posLC.y,2,0,2*Math.PI);
		ctx.fill();
		
		ctx.beginPath();
		ctx.arc(this.posRC.x,this.posRC.y,2,0,2*Math.PI);
		ctx.fill();
		
	}
	
	return Vehicle;
	
}();