let wind;
let particles = [];
let repellers = [];

let scl;
let cols;
let rows;

let strengthDivider;

let jetArr = [];


function setup() {
    createCanvas(1280,720);
    
    // set wind
    wind = createVector(0.1,0);

    // set jet!
    for(let i=0; i<width; i++) {
        jetArr[i] = height/2;
    }

    // add particles
    for(let i=0; i<1000; i++) {
        let p = new particle();
        particles.push(p);
    }

    // add repellers
    scl = 80;
    cols = floor(width/scl);
    rows = floor(height/scl);
    for(let y=0; y<rows; y++) {
        for(let x=0; x<cols; x++) {
            let index = x + y * cols
            repellers[index] = new Repeller(random(100), x*scl+scl/2+random(100), y*scl+scl/2+random(100));
        }
    }

    for(let i=0; i<10; i++) {
        let randomIndex = Math.floor(random(repellers.length));
        repellers[randomIndex].mass = 600;

    }

    strengthDivider = 10; // proto was 6

}

function draw() {
    //console.log(frameRate());
    //background(0);
    
    //let p = new particle();
    //particles.push(p);

    //wind.setMag(random(0.02, 2));
    wind.setMag(1);

    // repellers
    for(let i=0; i<repellers.length; i++) {
        repellers[i].show();
    }

    fill(0,10);
    rect(0,0,width,height);

    // particles
    for(let i=particles.length-1; i>=0; i--) {

        ///particles[i].applyForce(wind);

        // calculate how much wind based on distance from jet
        let w = particles[i].calculateWind(wind);
        particles[i].applyForce(w);

        for(let j=0; j<repellers.length; j++) {
            let force = repellers[j].repel(particles[i]);
            particles[i].applyForce(force);
        }

        particles[i].checkEdges();
        particles[i].update();
        let s = particles[i].separate(particles);
        particles[i].applyForce(s);
        particles[i].show();
        
    }

    // jet
    jetArr.pop();
    jetArr.unshift(mouseY);
    for(let i=0; i<jetArr.length; i++) {
        stroke(0,153,255);
        point(i, jetArr[i]);
    }
    
}


/* - - - */

class particle {
    constructor() {
        this.x = 200;
        this.y = 300;
        this.vx = random(-1,1);
        this.vy = random(-5,-1);
        this.alpha = 255;
        this.size = random(8,32);
        //
        this.position = createVector(random(width),random(height));
        this.prevPosition = this.position;
        let rx = random(-1,1);
        if(rx == 0) { rx = 1};
        this.velocity = createVector(0,0);
        this.acceleration = createVector(0,0);
        this.mass = 3;//random(1,3);
        
    }

    applyForce(force) {
        let v = force.copy();
        let f = v.div(this.mass);
        this.acceleration.add(f);
    }

    separate(ps) {
        let sepDist = 16.0;
        let steer = createVector(0,0);
        let count = 0;

        for(let i=0; i<ps.length; i++) {
            let d = p5.Vector.dist(this.position, ps[i].position);
            if((d>0) && (d<sepDist)) {
                
                let diff = p5.Vector.sub(this.position, ps[i].position);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }
        if(count>0) {
            steer.div(count);
        }
        if(steer.mag() > 0) {
            steer.normalize();
            steer.mult(10) // max speed
            steer.sub(this.velocity);
            steer.limit(0.3) // max steering force
        }
        return steer;
    }


    update() {
        //this.x += this.vx;
        //this.y += this.vy;
        //this.alpha -= 5;
        this.velocity.add(this.acceleration);
        
        //this.velocity.limit(3); // limit the velocity this was the value
        this.velocity.mult(0.9); // new line instead of limit
        this.position.add(this.velocity);
        this.acceleration.mult(0);

    }

    calculateWind(v) {
        let w = v.copy();
        let d = dist(this.position.x, this.position.y, this.position.x, jetArr[round(this.position.x)]);
        let f = (height-d)/height;
        f *= f*3;
        w.mult(f);
        //console.log(round(d));
        return w;
    }

    show() {
        fill(255,this.alpha);
        noStroke();
        //stroke(255,this.alpha);
        ellipse(this.position.x, this.position.y, this.mass );
    }

    finished() {
        return this.alpha < 0;
    }

    checkEdges() {
        if(this.position.x > width) {
            //this.position = createVector(random(width),random(height));
            //this.position = createVector(0,random(height));
            //this.position = createVector(0,jetArr[0]+random(-50,50));
            //this.velocity.mult(0);
            //this.prevPosition = this.position;
            this.resetPosition();
        }
        else if(this.position.x < 0) {
            //this.position = createVector(random(width),random(height));
            //this.position = createVector(0,random(height));
            //this.position = createVector(0,jetArr[0]+random(-50,50));
            //this.velocity.mult(0);
            //this.prevPosition = this.position;
            this.resetPosition();
        }
        else if(this.position.y > height) {
            //this.position = createVector(random(width),random(height));
            //this.position = createVector(0,random(height));
            //this.position = createVector(0,jetArr[0]+random(-50,50));
            //this.velocity.mult(0);
            //this.prevPosition = this.position;
            this.resetPosition();
        }
        else if(this.position.y > height) {
            //this.position = createVector(random(width),random(height));
            //this.position = createVector(0,random(height));
            //this.position = createVector(0,jetArr[0]+random(-50,50));
            //this.velocity.mult(0);
            //this.prevPosition = this.position;
            this.resetPosition();
        }
    }

    resetPosition() {

        let r = random(0,1);

        if(r < 0.3) {
            this.position = createVector(random(width),random(height));
        } else if(r > 0.9) {
            this.position = createVector(0,random(height));
        } else {
            this.position = createVector(0,jetArr[0]+random(-80,80));
        }
        this.velocity.mult(0);
            this.prevPosition = this.position;
    }
}

/* - - - */

class Repeller {
    constructor(m, x, y) {
        this. position = createVector(x,y);
        this.mass = m;
        this.g = 1.5
    }

    repel(p) {
        let copyPosition = this.position.copy();
        let force = copyPosition.sub(p.position);
        let d = force.mag();
        d = constrain(d,20,300);
        force.normalize();
        let n = 4; // increase the n value to make bigger avoidance of circles
        let strength = (this.g * this.mass * p.mass) / (d*d/4); 
        force.mult(strength/strengthDivider);
        force.mult(-1);
        return force;
    }

    show() {
        noStroke();
        fill(255,0,0,10);
        ellipse(this.position.x, this.position.y, this.mass/strengthDivider)
    }


}