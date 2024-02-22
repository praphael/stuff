// all dimensions in feet
const ICE_LENGTH = 200;
const ICE_WIDTH = 85;
// margin between the rink and the BOARDS 
const RINK_MARGIN_WIDTH = 10;
const RINK_MARGIN_LENGTH = 10;
const RINK_LENGTH = ICE_LENGTH + RINK_MARGIN_LENGTH;
const RINK_WIDTH = ICE_WIDTH + RINK_MARGIN_WIDTH;

// distance between goal line and the BOARDS
const GOAL_LINE_DIST_END = 11;
const GOAL_WIDTH = 6;
const GOAL_DEPTH = 4;
const CREASE_DEPTH = 4;
const CREASE_RADIUS = 3;
const BLUE_LINE_GOAL_DIST = 64;
// distance betwen blue lines
const BLUE_LINE_DIST = 50;

// distance between faceoff circles perp to dir of play (rink length)
const FACEOFF_CIRCLE_SEP = 44;
const FACEOFF_CIRCLE_RAD = 15;
const FACEOFF_CIRCLE_DOT_RAD = 1;
const FACEOFF_CIRCLE_NZ_DIST_BLUE_LINE = 1;
const FACEOFF_CIRCLE_AZ_DIST_GOAL_LINE = 5+FACEOFF_CIRCLE_RAD;
const FACEOFF_CIRCLE_THICKNESS = 0.5;

const BOARD_CORNER_RAD_LEN = 22;
const BOARD_CORNER_RAD_WIDTH = 11;
// TODO define viewport, so we don't have to draw entire rink

const BOARD_CORNER_NUM_SEGS = 16;

const BOARD_THICKNESS = 1;
const BLUE_LINE_THICKNESS = 0.5;
const CENTER_LINE_THICKNESS = 5;

//const BOARD_COLOR = "rgb(50, 50, 50)";
const BOARD_COLOR = "rgb(128 128 128)";
const BLUE_LINE_COLOR = "rgb(40 40 148)";
const RED_LINE_COLOR = "rgb(148 40 40)";
const ICE_COLOR = 'rgb(245 245 245)';
const CENTER_ICE = { x:RINK_WIDTH/2, y:RINK_LENGTH/2};

const GOAL_LINES = [[new Point(0, 0), new Point(0, 0)], [new Point(0, 0), new Point(0, 0)]];
const BLUE_LINES = [[new Point(0, 0), new Point(0, 0)], [new Point(0, 0), new Point(0, 0)]];
const CREASE_AREAS = [[], []];
const GOAL_AREAS = [[], []];

class EllipticalParams {
    constructor(a, b, e) {
        this.a = a;
        this.b = b;
        this.e = e;
    }
}

class Rink {
    BOARDS = [];
    constructor() {
        this.initRink();
    }

    /*
    addBoardCorner(cx, cy, phiBegin, phiEnd) {
        // boardPoints.push({x:cx, y:cy});
        
        dphi = (phiEnd - phiBegin) / BOARD_CORNER_NUM_SEGS;
        for (let i=0; i<BOARD_CORNER_NUM_SEGS; i++) {
            const phi = phiBegin + i*dphi;
            x1 = cx + BOARD_CORNER_RAD_WIDTH*Math.cos(phi);
            y1 = cy - BOARD_CORNER_RAD_LENGTH*Math.sin(phi);
            BOARDS.push({x:x1, y:y1});
        }
    } */

    initRink() {
        const xMgn = RINK_MARGIN_WIDTH;
        const yMgn = RINK_MARGIN_LENGTH;
        const bcrX = BOARD_CORNER_RAD_WIDTH;
        const bcrY = BOARD_CORNER_RAD_LEN;
        const rw = RINK_WIDTH;
        const rl = RINK_LENGTH;

        // board center of ellipitcal arch
        const cx1 = rw-xMgn-bcrX;
        const cy1 = yMgn+bcrY;
        const cx2 = xMgn+bcrX;
        const cy2 = rl-yMgn-bcrY;

        // start at lefttmost point and work clocksiwe
        var x1 = xMgn;
        let x2 = xMgn + bcrX;
        let x3 = rw - xMgn - bcrX;
        let x4 = rw - xMgn;
        let y1 = yMgn + bcrY;
        let y2 = yMgn;
        let y3 = rl - yMgn - bcrY;
        let y4 = rl - yMgn;

        this.BOARDS.push({x:x1, y:y1});
        this.BOARDS.push({x:x2, y:y2});
        this.BOARDS.push({x:x3, y:y2});
        this.BOARDS.push({x:x4, y:y1});
        this.BOARDS.push({x:x4, y:y3});
        this.BOARDS.push({x:x3, y:y4});
        this.BOARDS.push({x:x2, y:y4});
        this.BOARDS.push({x:x1, y:y3});

        this.BOARDS.forEach((p) => { logMessage("x= " + p.x + " y= " + p.y)});

        //addBoardCorner(cx1, cy1, 0, Math.PI/2);
        // addBoardCorner(cx2, cy1, Math.PI/2, Math.PI);
        // addBoardCorner(cx2, cy2, Math.PI, 3*Math.PI/2);
        // addBoardCorner(cx1, cy2, 3*Math.PI/2, 2*Math.PI);
        
        let y = CENTER_ICE.y - BLUE_LINE_DIST/2;
        BLUE_LINES[0][0].x = xMgn;
        BLUE_LINES[0][0].y = y;
        BLUE_LINES[0][1].x = rw-xMgn;
        BLUE_LINES[0][1].y = y;
        y = CENTER_ICE.y + BLUE_LINE_DIST/2;
        BLUE_LINES[1][0].x = xMgn;
        BLUE_LINES[1][0].y = y;
        BLUE_LINES[1][1].x = rw-xMgn;
        BLUE_LINES[1][1].y = y;

        // find x intercept delta where goal line intercepts board ellpitical curvature
        // use quation of ellispe, x*x/a*a + y*y/b*b = 1
        let a = BOARD_CORNER_RAD_WIDTH;
        let b = BOARD_CORNER_RAD_LEN;
        y = yMgn + GOAL_LINE_DIST_END;
        let dy = yMgn + b - y;// y2 = b-(GOAL_LINE_DIST_END - y);
        // dx = (a*a)*Math.sqrt(1 - dy*dy/(b*b));
        let dx = 0.8*a;
        logMessage("a= " + a + " b= " + b + " y= " + y + " yMgn= " + yMgn + " dy= " + dy + " dx= " + dx);
        // dx = 0;
        
        y = yMgn + GOAL_LINE_DIST_END;
        GOAL_LINES[0][0].x = cx1 + dx;
        GOAL_LINES[0][0].y = y;
        GOAL_LINES[0][1].x = cx2 - dx;
        GOAL_LINES[0][1].y = y;
        y = ICE_LENGTH - GOAL_LINE_DIST_END;
        GOAL_LINES[1][0].x = cx1 + dx;
        GOAL_LINES[1][0].y = y;
        GOAL_LINES[1][1].x = cx2 - dx;
        GOAL_LINES[1][1].y = y;

        x1 = CENTER_ICE.x-GOAL_WIDTH/2;
        x2 = CENTER_ICE.x+GOAL_WIDTH/2;
        for(let i=0; i<2; i++) {
            y1 = GOAL_LINES[i][0].y;
            dy = CREASE_DEPTH;
            if (i == 1) dy=-dy;
            y2 = y1 + dy;
            CREASE_AREAS[i] = new Array(4);
            
            CREASE_AREAS[i][0] = new Point(x1, y1);
            CREASE_AREAS[i][1] = new Point(x1, y2);
            CREASE_AREAS[i][2] = new Point(x2, y2);
            CREASE_AREAS[i][3] = new Point(x2, y1);
            CREASE_AREAS[i].forEach((p) => { 
                logMessage(`CREASE_AREAS[${i}] x= ${p.x} y= ${p.y}`); 
            });

            dy = GOAL_DEPTH;
            if (i == 0) dy=-dy;
            y2 = y1 + dy;
            GOAL_AREAS[i] = new Array(4);
            GOAL_AREAS[i][0] = new Point(x1, y1);
            GOAL_AREAS[i][1] = new Point(x1, y2);
            GOAL_AREAS[i][2] = new Point(x2, y2);
            GOAL_AREAS[i][3] = new Point(x2, y1);
            GOAL_AREAS[i].forEach((p) => { 
                logMessage(`GOAL_AREAS[${i}] x= ${p.x} y= ${p.y}`); 
            });
        }

        const a1 = Math.abs(this.BOARDS[1].x-this.BOARDS[0].x);
        const b1 = Math.abs(this.BOARDS[0].y-this.BOARDS[1].y);
        const e = Math.sqrt(1-b1*b1/(a1*a1));
        this.ellipticalParams = new EllipticalParams(a1, b1, e);
    }

    drawBoards(ctx) {
        const bc = this.BOARDS;
        const rX = BOARD_CORNER_RAD_WIDTH;
        const rY = BOARD_CORNER_RAD_LEN;
        let x = bc[1].x;
        let y = bc[0].y;

        // since ellipse closes the path we need to draw ice in middle area
        // draw ice 
        ctx.beginPath();
        ctx.moveTo(bc[0].x, bc[0].y);
        ctx.lineTo(bc[1].x, bc[1].y);
        ctx.lineTo(bc[3].x, bc[3].y);
        ctx.lineTo(bc[5].x, bc[5].y);
        ctx.lineTo(bc[7].x, bc[7].y);
        ctx.closePath();
        ctx.fillStyle = ICE_COLOR;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(x, y, rX, rY, 0, Math.PI, -Math.PI/2);
        ctx.lineWidth = BOARD_THICKNESS;
        ctx.strokeStyle = BOARD_COLOR;
        ctx.fillStyle = ICE_COLOR;
        //ctx.fill();
        
        ctx.moveTo(bc[1].x, bc[1].y);
        ctx.lineTo(bc[2].x, bc[2].y);
        x = bc[2].x;
        ctx.ellipse(x, y, rX, rY, 0, -Math.PI/2, 0);
        //ctx.fill();
        //ctx.beginPath();
        ctx.moveTo(bc[3].x, bc[3].y);
        ctx.lineTo(bc[4].x, bc[4].y);
        y = bc[4].y;
        ctx.ellipse(x, y, rX, rY, 0, 0, Math.PI/2);
        //ctx.fill();
        //ctx.beginPath();
        ctx.moveTo(bc[5].x, bc[5].y);
        ctx.lineTo(bc[6].x, bc[6].y);
        x = bc[1].x;
        ctx.ellipse(x, y, rX, rY, 0, Math.PI/2, Math.PI);
        //ctx.fill();
        //ctx.beginPath();
        ctx.moveTo(bc[7].x, bc[7].y);
        ctx.lineTo(bc[0].x, bc[0].y);
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // draw boards
    }


    drawLines(ctx) {
        const xMgn = RINK_MARGIN_WIDTH;
        const rw = RINK_WIDTH;
        // center line
        ctx.beginPath();
        ctx.moveTo(xMgn, CENTER_ICE.y);
        ctx.lineTo(rw - xMgn, CENTER_ICE.y);
        ctx.lineWidth = BLUE_LINE_THICKNESS;
        ctx.fillStyle = RED_LINE_COLOR;
        ctx.strokeStyle = RED_LINE_COLOR;
        // ctx.strokeStyle = "red";
        ctx.closePath();
        ctx.stroke();

        // blue lines
        ctx.fillStyle = BLUE_LINE_COLOR;
        ctx.strokeStyle = BLUE_LINE_COLOR;
        ctx.lineWidth = BLUE_LINE_THICKNESS;
        for(let i=0; i<2; i++) {
            ctx.beginPath();
            ctx.moveTo(BLUE_LINES[i][0].x, BLUE_LINES[i][0].y);
            ctx.lineTo(BLUE_LINES[i][1].x, BLUE_LINES[i][1].y);
            ctx.closePath();
            ctx.stroke();
        }

        // goal lines
        ctx.fillStyle = RED_LINE_COLOR;
        ctx.strokeStyle = RED_LINE_COLOR;
        ctx.lineWidth = BLUE_LINE_THICKNESS;
        for(let i=0; i<2; i++) {
            ctx.beginPath();
            ctx.moveTo(GOAL_LINES[i][0].x, GOAL_LINES[i][0].y);
            ctx.lineTo(GOAL_LINES[i][1].x, GOAL_LINES[i][1].y);
            ctx.closePath();
            ctx.stroke();
        }        
    }


    drawFaceoffCircles(ctx) {
        const xMgn = RINK_MARGIN_WIDTH;
        const yMgn = RINK_MARGIN_LENGTH;
        ctx.beginPath();
        ctx.arc(CENTER_ICE.x, CENTER_ICE.y, FACEOFF_CIRCLE_RAD, 0, 2 * Math.PI);
        //ctx.closePath();
        ctx.strokeStyle = BLUE_LINE_COLOR;
        ctx.lineWidth = FACEOFF_CIRCLE_THICKNESS;
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = RED_LINE_COLOR;
        ctx.arc(CENTER_ICE.x, CENTER_ICE.y, FACEOFF_CIRCLE_DOT_RAD, 0, 2 * Math.PI);
        ctx.fill();

        let dx = xMgn + (ICE_WIDTH - FACEOFF_CIRCLE_SEP)/2;
        let dy = GOAL_LINES[0][0].y + FACEOFF_CIRCLE_AZ_DIST_GOAL_LINE; 
        let dyNZ = BLUE_LINES[0][0].y + FACEOFF_CIRCLE_NZ_DIST_BLUE_LINE; 
        for(let i=0; i<4; i++) {
            ctx.beginPath();
            let x = dx;
            if(i == 1 || i == 3)
                x = RINK_WIDTH-dx;
            let y = dy;
            if(i == 2 || i == 3)
                y = RINK_LENGTH-dy;
            // logMessage(`i= ${i} x= ${x} y= ${y}`);
            ctx.strokeStyle = RED_LINE_COLOR;
            ctx.arc(x, y, FACEOFF_CIRCLE_RAD, 0, 2 * Math.PI);
            ctx.closePath();
            
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y, FACEOFF_CIRCLE_DOT_RAD, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = RED_LINE_COLOR;
            ctx.fill();
        }
    }

    drawGoals(ctx) {
        for(let i=0; i<2; i++) {
            ctx.beginPath();
            ctx.moveTo(CREASE_AREAS[i][0].x, CREASE_AREAS[i][0].y);
            for(j=1; j<CREASE_AREAS[i].length; j++) {
                ctx.lineTo(CREASE_AREAS[i][j].x, CREASE_AREAS[i][j].y);
            }
            ctx.strokeStyle = RED_LINE_COLOR;
            ctx.lineWidth = FACEOFF_CIRCLE_THICKNESS;
            ctx.closePath();
            ctx.stroke();
        }

        for(let i=0; i<2; i++) {
            ctx.beginPath();
            ctx.moveTo(GOAL_AREAS[i][0].x, GOAL_AREAS[i][0].y);
            for(j=1; j<GOAL_AREAS[i].length; j++) {
                ctx.lineTo(GOAL_AREAS[i][j].x, GOAL_AREAS[i][j].y);
            }
            ctx.strokeStyle = RED_LINE_COLOR;
            ctx.lineWidth = FACEOFF_CIRCLE_THICKNESS;
            ctx.closePath();
            ctx.stroke();
        }
    }

    draw(ctx) {
        // ctx.putImageData(background, 0, 0);
        this.drawBoards(ctx);
        this.drawLines(ctx);
        this.drawFaceoffCircles(ctx);
        this.drawGoals(ctx);
    }

}