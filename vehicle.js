var app = app || {};

app.Vehicle = function() {
	function Vehicle(_type) {
		this.type = _type;
		this.pos = new Victor(window.innerWidth / 2, window.innerHeight*.988 /2);
		
		this.velocity = new Victor(0, -1);
		
		this.acceleration = new Victor(0,0);
		this.acceleration.x = 0;
		this.acceleration.y = 0;
		
		this.moveDir = new Victor(0,0);
		
		this.posLC = new Victor(this.pos.x - 15, this.pos.y - 15);
		
		this.posRC = new Victor(this.pos.x + 15, this.pos.y - 15);
		
		this.rotation = 0;
		
		this.leftForce = new Victor(0,0);
		this.rightForce = new Victor(0,0);
		
		this.leftLightForce = 0;
		this.rightLightForce = 0;
		this.lastPos = this.pos.clone();
	};
	
	var v = Vehicle.prototype;
	
	
	v.update = function(Lights, ctx, dctx, AttractVehicleColor, AttractVehicleTrail, RepelVehicleColor, RepelVehicleTrail) {
	
		this.leftLightForce = 0;
		this.rightLightForce = 0;
		var ltemp, rtemp;
		this.lastPos = this.pos.clone();
		
		for(var i = 0; i < Lights.length; i++)
		{
			ltemp = (Lights[i].brightness) / (Lights[i].pos.distance(this.posLC));
			rtemp = (Lights[i].brightness) / (Lights[i].pos.distance(this.posRC));
			if(Math.abs(ltemp) > Math.abs(rtemp))
				this.leftLightForce += (ltemp);
			else
				this.rightLightForce += (rtemp);
		}
		
		
		
		
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
		
		var leftLine = this.posLC.clone();
		leftLine.add(this.leftForce);
		
		var rightLine = this.posRC.clone();
		rightLine.add(this.rightForce);
		
		var moveDirTemp = leftLine.clone();
		moveDirTemp.subtract(rightLine);
		moveDir = new Victor(moveDirTemp.y*-1, moveDirTemp.x);
		moveDir.normalize();
		
		this.acceleration.multiply(new Victor(0,0));
		this.acceleration = moveDir.clone();
		// console.log("\na = " + this.acceleration);
		this.acceleration.multiply(new Victor(this.rightLightForce + this.leftLightForce, this.leftLightForce + this.rightLightForce));
		// console.log("rightLightForce: " + this.rightLightForce);
		// console.log("leftLightForce: " + this.leftLightForce);
		// console.log("Sum: " + (this.rightLightForce + this.leftLightForce));
		// console.log("a = " + this.acceleration);
		
		var temp = this.velocity.clone();
		temp.normalize();
		
		if(Math.abs(temp.x) > .1 || Math.abs(temp.y) > .1)
		{
			var friction = this.velocity.clone();
			friction.multiply(new Victor(-1,-1));
			friction.normalize();
			friction.multiply(new Victor(.15,.15));
			this.acceleration.add(friction);
		}
		//console.log("a = " + this.acceleration);
		
		this.velocity.add(this.acceleration);
		//console.log("v = " + this.velocity);
		
		
		if(this.velocity.length() > 7)
		{
			this.velocity.normalize();
			this.velocity.multiply(new Victor(7,7));
		}
		//console.log("v = " + this.velocity);
		
		this.rotation = this.velocity.angle();
		this.pos.add(this.velocity);
		
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
			//console.log(this.type);
			dctx.restore();
		}
			
			
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
		
		ctx.beginPath();
		ctx.arc(this.posLC.x,this.posLC.y,2,0,2*Math.PI);
		ctx.fill();
		
		ctx.beginPath();
		ctx.arc(this.posRC.x,this.posRC.y,2,0,2*Math.PI);
		ctx.fill();
		
	}
	
	return Vehicle;
	
}();