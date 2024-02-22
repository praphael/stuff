const PLAYER_RAD = 1;
const PUCK_RAD = 0.1;
// maximum velocity of all objects (feet/second)
const VELOCITY_MAX = 30;
const VELOCITY_INC = 0.1;
const COLOR_PLAYER_WITH_PUCK = "rgb(0, 192, 200)";
const COLOR_PUCK = "black";
const PLAYER_NUM_SEGS = 12;
const NUM_PLAYERS_PER_TEAM = 6;
const NUM_GAME_OBJS = NUM_PLAYERS_PER_TEAM*2+1;

// roles for player
const PLAYER_ROLES = ["C", "LW", "RW", "LD", "RD", "G", "EA"];

// angle that defenseman
const DEF_ANG = Math.PI/3;
const COS_D = Math.cos(DEF_ANG);
const SIN_D = Math.sin(DEF_ANG);
// conceptual "offset" of player in formation
// useful for calculating faceoff start position
const ROLE_OFFSET = [[0, 0], [-1, 0], [1, 0], [-COS_D, -SIN_D], [COS_D, -SIN_D], [0, -3], [0, -1]];

class GameObject {
    constructor(objType) {
        this.pos = new Point(0, 0);
        this.vel = new Point(0, 0);
        this.radius = 1;
        this.color = "blue";
        this.objType = objType;
    }

    draw(ctx) {
        // [r, g, b] = p.clr;
        
        let pos = this.pos;
        let radius = this.radius;
        /*
        ctx.moveTo(pos.x + radius/2, pos.y);
        for(i=0; i<obj.numSegs; i++) {
            const phi = 2*i*Math.PI/pos.numSegs;
            // logMessage("phi=" + p);
            xd = radius*Math.cos(phi)/2;
            yd = radius*Math.sin(phi)/2;
            // logMessage("x, y =" + xd + yd);
            ctx.lineTo(pos.x + xd, pos.y+yd);
        }
        */
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2*Math.PI);
        //ctx.moveTo(pos.x + radius/2, pos.y);
        ctx.fillStyle = this.color; // 'rgb(${r} ${g} ${b})';
        ctx.strokeStyle = this.color; // 'rgb(${r} ${g} ${b})';
        // logMessage("radius= " + radius);
        // logMessage("pos x= " + pos.x + " pos.y= " + pos.y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        // ctx.fillRect(x, y, rw, rh);
    }

    changeVel(dx, dy) {
        let vMax = VELOCITY_MAX;
        if (Math.abs(dx) < vMax && Math.abs(dy) < vMax) {
            this.vel.x += dx;
            this.vel.y += dy;
            let vx = this.vel.x;
            let vy = this.vel.y;
            
            const v2 = vx*vx + vy*vy;
            if(v2 > vMax*vMax) {
                if(vx == 0) {
                    this.vel.y = vMax;
                }
                else {
                    const phi = Math.atan(vy/vx);
                    this.vel.x = vMax*Math.cos(phi);
                    this.vel.y = vMax*Math.sin(phi);
                }
            }
        }
    }

    updatePos() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    detectHandleBoardCollision(boards, boardEllipitalParams) {
        // determine if radii overlap
        const x = this.pos.x;
        const y = this.pos.y;
        const lx = boards[0].x;
        const hx = boards[3].x;
        const ly = boards[1].y;
        const hy = boards[5].y;
        const vx = this.vel.x;
        const vy = this.vel.y;

        let debug = false;

        //logMessage("detectHandleBoardCollision team= " + this.team + " role= " + this.role);

        if (this.team === 0 && this.role === 0 && Math.random() > 0.99)
            debug = true;

        if (debug)
            logMessage("detectHandleBoardCollision x=" + x + " y= " + y + " lx= " + lx + " hx= " + hx + " ly= " + ly + " hy= " + hy);
        
        // detect collision with straight segments
        // test for velocity as well, because possible we are outside the clip area
        // and not being able to get back in due to repeated tests for colision
        if((x < lx && vx < 0) || (x > hx && vx > 0)) {
            this.vel.x = -this.vel.x;
        }
        else if((y < ly && vy < 0) || (y > hy && vy > 0)) {
            this.vel.y = -this.vel.y;
        } 
        else {
            // detect collision corner areas
            const x1 = boards[1].x;
            const x2 = boards[2].x;
            const y1 = boards[0].y;
            const y2 = boards[4].y;
            const a = boardEllipitalParams.a;
            const b = boardEllipitalParams.b;
            
            // slope of line connecting x and y intercepts of ellipse
            const m = (y2-y1)/(x2-x1);
            const y_int = (y1+y2)/(2*(x1+x2));
            // delta of y expected, given x value
            const ye_d = b*Math.sqrt(1-x*x/(a*a));

            // let isPossibleCollision = false;
            if(x < x1) {
                dx = x1-x;
            
                // test for velocity to guard against going past the clip area 
                // and not being able to get back in
                if(y < y1 && (vx < 0 || vy < 0)) {
                    dy = y1-y;
                    if (y < y_e) { // collision
                        
                    }
                }
                else if(y > y2 && (vx < 0 || vy > 0)) {
                    dy = y-y2;
                    if (y > y_e) { // collision

                    }
                }
            }
            else if(x > x2) {
                dx = x-x2;
                if(y < y1 && (vx > 0 || vy < 0)) {
                    dy = y1-y;
                    if (y < y_e) {

                    }
                }
                else if(y > y2 && (vx > 0 || vy < 0)) {
                    dy = y-y2;
                    if (y > y_e) {
                    }
                }
            }
            if (debug) {
                logMessage("corner x1= " + x1 + " x2= " + x2 + " y1= " + y1 + " y2= " + y2);
                logMessage("corner ellipse a= " + a + " b= " + b);
                logMessage("corner dx= " + dx + " dy= " + dy);
                logMessage("corner isPossibleCollision= " + isPossibleCollision);
            }
            
            /* ellipse intercept detection, unfortunately rather broken 

            if (isPossibleCollision) {
                
               
                const d2 = dx*dx + dy*dy;
                const phi = Math.atan(dy/dx);
                const c = Math.cos(phi);
                const s = Math.sin(phi);
                const cos2 = c*c;
                const sin2 = s*s;
                const r = (a*b)/(b*cos2 + a*sin2);
                const r2 = r*r;
                if(debug)
                    logMessage("d2= " + d2 + " r2= " + r2 + " phi= " + 180*phi/Math.PI + " cos2= " + cos2);
                // collision
                if(d2 > r2) {
                    const th = Math.atan(this.vel.y/this.vel.x);
                    const rebAng = th - phi;
                    // if(debug)
                    logMessage("corner colllision dx= " + dx + " dy= " + dy + " d2= " + d2 + " r2= " + r2);
                    logMessage("corner collision th= " + 180*th/Math.PI + " rebAng= " + 180*rebAng/Math.PI);
                    const vMag = Math.sqrt(this.vel.x*this.vel.x + this.vel.y*this.vel.y);
                    this.vel.x = vMag*Math.cos(rebAng);
                    this.vel.y = vMag*Math.sin(rebAng);
                }
            }
                            */

        }
    }
}

class Player extends GameObject {
    constructor(team, role) {
        super("player");
        this.role = role;
        this.faceAngle = 0;
        this.team = team;
        this.radius = PLAYER_RAD;
    }

    // set player appropriate position for faceoff
    setPlayerInFaceOffPos(faceoffDotPt, faceoffCirRad, faceoffCirDotRad, reverse, creaseAreas) {
        let rev = -1;
        if (reverse)
            rev = 1;
        if (PLAYER_ROLES[this.role] == "G") {
            let g = Math.floor((-1*rev+1)/2); // map -1,1 to 0, 1
            let p1 = creaseAreas[g][2];
            let p2 = creaseAreas[g][3];
            this.pos.x = (p1.x + p2.x)/2;
            this.pos.y = p1.y;
        }
        else {
            let offX = ROLE_OFFSET[this.role][0];
            let offY = ROLE_OFFSET[this.role][1];
            logMessage("offX= " + offX + " offY= " + offY);
            logMessage("faceoffDotPt " + faceoffDotPt.x + " " + faceoffDotPt.y + " faceoffCirRad " + faceoffCirRad + " faceoffCirDotRad " + faceoffCirDotRad);
            this.pos.x = faceoffDotPt.x + rev*offX*faceoffCirRad;
            this.pos.y = faceoffDotPt.y + rev*offY*faceoffCirRad - rev*faceoffCirDotRad - rev*this.radius;
        }

        logMessage("team " + this.team + " " + PLAYER_ROLES[this.role] + " pos= " + this.pos.x + " " + this.pos.y);
    }

    
}

function detectColision(obj1, obj2) {
    // determine if radii overlap
    const dx = obj1.pos.x - obj2.pos.x;
    const dy = obj1.pos.y - obj2.pos.y;
    const d2 = dx*dx + dy*dy;
    const r = obj1.radius + obj2.radius;
    return d2 < r*r;
}

function handleCollision(obj1, obj2) {
    tx = obj1.vel.x;
    ty = obj1.vel.y;
    // perfectly elastic collision
    obj1.vel.x = -obj2.vel.x;
    obj1.vel.y = -obj2.vel.y;
    obj2.vel.x = -tx;
    obj2.vel.y = -ty;
}

function initObjects(objs, teamColors, centerIce, faceoffCirRad, faceoffCirDotRad, creaseAreas) {
    // init players
    for(i=0; i<2; i++) {
        for(j=0; j<NUM_PLAYERS_PER_TEAM; j++) {
            player = new Player(i, j);
            player.color = teamColors[i];
            player.setPlayerInFaceOffPos(centerIce, faceoffCirRad, faceoffCirDotRad, i==0, creaseAreas);
            objs.push(player);
        }
    }
    
    puck = new GameObject("puck");
    objs.push(puck);
    puck.radius = PUCK_RAD;
    puck.color = COLOR_PUCK;
    puck.pos = { ...CENTER_ICE};
}