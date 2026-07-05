export const turtleAPI = {
  fillpath: null,
  fillcol: "black",
  pencol: "black",
  _addToFill: function(nx, ny) {
    if (this.fillpath) this.fillpath.push({x: nx, y: ny});
  },
  reset: function() {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.angle = -90;
    this.penDown = true;
    this.fillpath = null;
    this.fillcol = "black";
    this.pencol = "black";
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
  },
  home: function() {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ox = this.x, oy = this.y;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.angle = -90;
    const ctx = canvas.getContext('2d');
    if(this.penDown) {
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else {
      ctx.moveTo(this.x, this.y);
    }
    this._addToFill(this.x, this.y);
  },
  forward: function(d) {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const rad = this.angle * (Math.PI / 180);
    const ox = this.x, oy = this.y;
    this.x += d * Math.cos(rad);
    this.y += d * Math.sin(rad);
    if(this.penDown) {
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else {
      ctx.moveTo(this.x, this.y);
    }
    this._addToFill(this.x, this.y);
  },
  backward: function(d) { this.forward(-d); },
  right: function(a) { this.angle += a; },
  left: function(a) { this.angle -= a; },
  setheading: function(a) { this.angle = -90 + a; },
  heading: function() {
    let h = (-this.angle) % 360;
    if (h < 0) h += 360;
    return h;
  },
  penup: function() { this.penDown = false; },
  pendown: function() { this.penDown = true; },
  isdown: function() { return this.penDown; },
  color: function(c) {
    const canvas = document.getElementById('turtle-canvas');
    if(canvas) {
      this.pencol = c;
      this.fillcol = c;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = c;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
    }
  },
  pencolor: function(c) {
    const canvas = document.getElementById('turtle-canvas');
    if(canvas) {
      this.pencol = c;
      canvas.getContext('2d').strokeStyle = c;
    }
  },
  fillcolor: function(c) {
    this.fillcol = c;
    const canvas = document.getElementById('turtle-canvas');
    if(canvas) {
      canvas.getContext('2d').fillStyle = c;
    }
  },
  begin_fill: function() {
    this.fillpath = [{x: this.x, y: this.y}];
  },
  end_fill: function() {
    if(this.fillpath && this.fillpath.length > 0) {
      const canvas = document.getElementById('turtle-canvas');
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.fillStyle = this.fillcol;
      ctx.beginPath();
      ctx.moveTo(this.fillpath[0].x, this.fillpath[0].y);
      for(let i=1; i<this.fillpath.length; i++) {
        ctx.lineTo(this.fillpath[i].x, this.fillpath[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      this.fillpath = null;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
    }
  },
  write: function(text) {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.font = "16px Arial";
    ctx.fillStyle = this.pencol;
    ctx.fillText(text, this.x, this.y);
    ctx.restore();
  },
  stamp: function() {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180 + Math.PI/2);
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐢", 0, 0);
    ctx.restore();
  },
  pensize: function(s) {
    const canvas = document.getElementById('turtle-canvas');
    if(canvas) {
      canvas.getContext('2d').lineWidth = s;
      canvas.getContext('2d').beginPath();
      canvas.getContext('2d').moveTo(this.x, this.y);
    }
  },
  goto: function(args) {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const [dx, dy] = args;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const ox = this.x, oy = this.y;
    this.x = cx + dx;
    this.y = cy - dy;
    const ctx = canvas.getContext('2d');
    if(this.penDown) {
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else {
      ctx.moveTo(this.x, this.y);
    }
    this._addToFill(this.x, this.y);
  },
  circle: function(r) {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
    if(this.penDown) ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
  },
  clear: function() {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  },
  pos: function() {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return [0, 0];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    return [Math.round(this.x - cx), Math.round(cy - this.y)];
  },
  dot: function(size) {
    const canvas = document.getElementById('turtle-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = this.pencol;
    ctx.beginPath();
    ctx.arc(this.x, this.y, (size || 5) / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
};
