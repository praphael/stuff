class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    angle() {
        let ang = 0;
        if(y != 0) {
            ang = Math.atan(this.y/this.x);
        }
        if(this.x < 0) {
            if(this.y < 0) 
                ang = ang - Math.PI;
            else 
                ang = Math.PI - ang;
        }
        if(ang < 0) 
            ang += 2*Math.PI;

        return ang;
    }

    magnitude() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    // returns unit vector
    unitVector() {
        let ang = this.angle();
        return new Point(Math.cos(ang), Math.sin(ang));
    }

    normVector() {
        let ang = this.angle();
        ang -= Math.PI/2;
        return new Point(Math.cos(ang), Math.sin(ang));
    }

    // return dot product between this vector and 
    dotProduct(p) {
        return new Point(this.x+p.x, this.y*p.y);
    }
}

function logMessage(msg) {
    console.log(msg);
}