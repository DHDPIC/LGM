let wind;
let particles = [];
let repellers = [];

let scl;
let cols;
let rows;

let strengthDivider;

let jetArr = [];

p5.disableFriendlyErrors = true;

let showDepth = true;
let showRepel = true;
let showCalibrate = false;
let calibrating = false;
let resetCalibrate = true;
let challengeMode = false;
let showJet = true;

let tempXStart = 0;
let tempYStart = 0;
let calibrateXStart = 0;
let calibrateYStart = 0;
let calibrateXEnd = 1280;
let calibrateYEnd = 720;

let challengeIncreaser = 1.3;
let challengeDecreaser = 0.2;

let mapImage;

let challengeText;
let exploreText;

let cloudImage;
let cloudParticle;

let imgXScale = 1920 / 1280;
let imgYScale = 1080 / 720;

const offscreen = new OffscreenCanvas(1280, 720);
const img = new Image(); // Create new img element
img.crossOrigin = "Anonymous"; // essential to make it accessible

document.addEventListener("keyup", function (e) {
  //console.log("key press", e.key);
  if (e.key === "d") {
    showDepth = !showDepth;
  }
  if (e.key === "r") {
    showRepel = !showRepel;
  }

  if (e.key === "c") {
    showCalibrate = !showCalibrate;
    if (resetCalibrate) {
      calibrateXStart = 0;
      calibrateYStart = 0;
      calibrateXEnd = 1280;
      calibrateYEnd = 720;
      resetCalibrate = false;
    } else {
      resetCalibrate = true;
    }
  }

  if (e.key === "l") {
    challengeMode = !challengeMode;
  }

  if (e.key === "w") {
    showJet = !showJet;
  }
});

/*function mousePressed() {
  if (mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}*/

window.addEventListener("load", offDraw);

function offDraw() {
  img.src = "challengeblocktest-04.png"; //"depth-crop.png"; //"http://localhost:8090/";
  /*if (offscreen.getContext) {
        const off = offscreen.getContext("2d");
        off.drawImage(img, 0, 0, 960,540);

        let rx = Math.random()*960;
        let ry = Math.random()*540;

        const pixel = off.getImageData(rx, ry, 1, 1);
        const col = pixel.data;
        let r = col[0];
        let g = col[1];
        let b = col[2];
       // ctx.fillStyle = `rgb(${r},${g},${b})`;
        
        //ctx.fillRect(rx, ry, 10, 10);
        fill(r,g,b);
        ellipse(rx,ry,10,10);
    }*/
}

function preload() {
  mapImage = loadImage("CMOutline-04.png");
  challengeText = loadImage("challenge-text.png");
  exploreText = loadImage("explore-text.png");
  cloudImage = loadImage("cloud1.png");
}

function setup() {
  let canvas = createCanvas(1280, 720);
  //let canvas = createCanvas(displayWidth, displayHeight);
  canvas.parent("simulation-holder");

  console.log("pd", pixelDensity());

  // set wind
  wind = createVector(0.1, 0);

  // set jet!
  for (let i = 0; i < width; i++) {
    jetArr[i] = height / 2;
  }

  // add particles
  for (let i = 0; i < 300; i++) {
    let p = new particle();
    particles.push(p);
  }

  // add repellers
  scl = 40.0;
  cols = floor(width / scl);
  rows = floor(height / scl);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      //repellers[index] = new Repeller(random(100), x*scl+scl/2+random(100), y*scl+scl/2+random(100));
      repellers[index] = new Repeller(
        random(100),
        x * scl + scl / 2,
        y * scl + scl / 2
      );
    }
  }

  for (let i = 0; i < 10; i++) {
    let randomIndex = Math.floor(random(repellers.length));
    repellers[randomIndex].mass = 600;
  }

  strengthDivider = 10; //10; // proto was 6

  // create cloud
  cloudParticle = new cloud();
}

function draw() {
  //console.log(frameRate());
  //background(0);

  /*fill(0, 20);
  noStroke();
  rect(0, 0, width, height);*/
  background(0);

  if (!showCalibrate) {
    //wind.setMag(random(0.02, 2));
    wind.setMag(2.5);

    //
    //
    // repellers
    // get new repellers
    if (offscreen.getContext) {
      const off = offscreen.getContext("2d");
      off.drawImage(
        img,
        calibrateXStart * imgXScale,
        calibrateYStart * imgYScale,
        calibrateXEnd * imgXScale - calibrateXStart * imgXScale,
        calibrateYEnd * imgYScale - calibrateYStart * imgYScale,
        0,
        0,
        1280,
        720
      );
      // get pixel data
      const myPixels = off.getImageData(0, 0, 1280, 720);
      //const myPixels = off.getImageData(calibrateXStart,calibrateYStart,calibrateXEnd-calibrateXStart,calibrateYEnd-calibrateYStart);
      const pData = myPixels.data;
      //
      //console.log(rows*cols);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let index = x + y * cols;
          let indexScale = (x * scl + y * scl * cols * scl) * 4; //index*scl;
          //console.log(indexScale);

          // draw depth squares
          if (showDepth) {
            fill(
              pData[indexScale],
              pData[indexScale + 1],
              pData[indexScale + 2]
            );
            //stroke(255);
            noStroke();
            //rect(myx*6,myy*6,6,6);
            rect(x * 10, y * 10, 10, 10);
          }
          let m = 0;
          if (pData[indexScale] > 1) {
            m = 255 - pData[indexScale];
            m *= m * 0.01;
          }

          repellers[index].mass = m; //new Repeller(random(100), x*scl+scl/2+random(100), y*scl+scl/2+random(100));
        }
      }
    }
    // challenge mode
    if (challengeMode) {
      tint(255,255);
      image(mapImage, 0, 0);
      image(challengeText, 640 - challengeText.width / 2, 0);
      image(
        challengeText,
        640 - challengeText.width / 2,
        height - challengeText.height
      );
    } else {
      //tint(255,255);
      image(exploreText, 640 - exploreText.width / 2, 0);
      image(
        exploreText,
        640 - exploreText.width / 2,
        height - exploreText.height
      );
    }

    // show repellers
    if (showRepel) {
      for (let i = 0; i < repellers.length; i++) {
        repellers[i].show();
      }
    }

    

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      ///particles[i].applyForce(wind);

      // calculate how much wind based on distance from jet
      //let w = particles[i].calculateWind(wind);
      //particles[i].applyForce(w);

      //apply own wind
      particles[i].applyForce(particles[i].wind);

      for (let j = 0; j < repellers.length; j++) {
        let force = repellers[j].repel(particles[i]);
        particles[i].applyForce(force);
      }

      particles[i].checkEdges();
      particles[i].update();

      let s = particles[i].separate(particles);
      particles[i].applyForce(s);

      particles[i].show();
    }

    // cloud
    cloudParticle.applyForce(cloudParticle.wind);

    for (let j = 0; j < repellers.length; j++) {
      let force = repellers[j].repel(cloudParticle);
      cloudParticle.applyForce(force);
    }

    cloudParticle.checkEdges();
    cloudParticle.update();
    let s = cloudParticle.separate(particles);
    cloudParticle.applyForce(s);

    cloudParticle.show();

    // jet
    let jetY = height / 2;
    if (challengeMode) {
      jetY = height / 3;
    } else {
      jetY = noise(0.001 * frameCount) * 720;
    }
    console.log(jetY);
    jetArr.pop();
    jetArr.unshift(jetY);

    if (showJet) {
      noStroke();
      fill(0, 255, 255);
      ellipse(0, jetY, 10, 10);
    }
  }
  //
  //
  // calibrate
  if (showCalibrate) {
    const off = offscreen.getContext("2d");
    //off.drawImage(img,calibrateXStart,calibrateYStart,calibrateXEnd-calibrateXStart,calibrateYEnd-calibrateYStart, 0, 0, 1280, 720);
    off.drawImage(
      img,
      calibrateXStart * imgXScale,
      calibrateYStart * imgYScale,
      calibrateXEnd * imgXScale - calibrateXStart * imgXScale,
      calibrateYEnd * imgYScale - calibrateYStart * imgYScale,
      0,
      0,
      1280,
      720
    );

    let onn = drawingContext; //document.getElementById('onScreen').getContext('2d');
    onn.drawImage(offscreen, 0, 0, 1280, 720);
    //
    noFill();
    strokeWeight(1);
    //stroke(0,255,0);
    //rect(calibrateXStart,calibrateYStart,calibrateXEnd-calibrateXStart,calibrateYEnd-calibrateYStart);
    if (calibrating) {
      stroke(255, 255, 0);
      rect(tempXStart, tempYStart, mouseX - tempXStart, mouseY - tempYStart);
    }
  }
}

document.addEventListener("mousedown", function () {
  console.log("mouse down");
  calibrating = true;
  tempXStart = mouseX;
  tempYStart = mouseY;
  console.log(calibrateXStart, calibrateYStart);
});

document.addEventListener("mouseup", function () {
  console.log("mouse up");
  calibrating = false;
  calibrateXStart = tempXStart;
  calibrateYStart = tempYStart;
  calibrateXEnd = mouseX;
  calibrateYEnd = mouseY;
  console.log(mouseX, mouseY);
  //calibrate  = false;
});

/* - - - */

class particle {
  constructor() {
    this.trailLength = 16;
    this.position = createVector(Math.random() * width, Math.random() * height);
    this.positions = [];
    for(let p=0; p<this.trailLength; p++) {
      this.positions[p] = this.position;
    }
    this.prevPosition = this.position;
    let rx = Math.random() * 2 - 1;
    if (rx == 0) {
      rx = 1;
    }
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = 3; //random(1,3);
    //
    this.wind = this.calculateWind2(); //createVector(random(0.5,3),0);
  }

  applyForce(force) {
    let v = force.copy();
    let f = v.div(this.mass);
    this.acceleration.add(f);
  }

  separate(ps) {
    let sepDist = 16.0;
    let steer = createVector(0, 0);
    let count = 0;

    for (let i = 0; i < ps.length; i++) {
      let d = p5.Vector.dist(this.position, ps[i].position);
      if (d > 0 && d < sepDist) {
        let diff = p5.Vector.sub(this.position, ps[i].position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
        //
        if (ps[i].velocity > this.velocity) {
          this.velocity.add(ps[i].velocity.mult(0.5));
          //this.velocity.mult(1.01); // not good compared to above
          this.velocity.limit(10);
        }
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(10); // max speed
      steer.sub(this.velocity);
      steer.limit(0.3); // max steering force
    }
    return steer;
  }

  update() {
    this.prevPosition = this.position.copy();
    //
    this.positions.pop();
    this.positions.unshift(this.position.copy());
    
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
    let d = dist(
      this.position.x,
      this.position.y,
      this.position.x,
      jetArr[round(this.position.x)]
    );
    let f = (height - d) / height;
    f *= f * 3;
    w.mult(f);
    //console.log(round(d));
    return w;
  }

  calculateWind2() {
    let w = createVector(1.0, 0);
    let d = dist(
      this.position.x,
      this.position.y,
      this.position.x,
      jetArr[round(this.position.x)]
    );
    let f = (height - d) / height;
    f *= f * 3;
    w.mult(f);
    //console.log(round(d));
    return w;
  }

  show() {
    //fill(255,this.alpha);
    //noStroke();
    //stroke(255,this.alpha);
    //ellipse(this.position.x, this.position.y, this.mass );
    
    strokeWeight(1); //strokeWeight(this.mass);
    noFill();
    /*line(
      this.position.x,
      this.position.y,
      this.prevPosition.x,
      this.prevPosition.y
    );*/
    for(let p=0; p<this.positions.length-1; p++) {
      stroke(255, 255-255*(p/(this.positions.length-1)));
      line(
        this.positions[p].x,
        this.positions[p].y,
        this.positions[p+1].x,
        this.positions[p+1].y,
      );
    }
  }

  finished() {
    return this.alpha < 0;
  }

  checkEdges() {
    if (this.position.x > width+100) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    } else if (this.position.x < -100) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    } else if (this.position.y > height+100) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    } else if (this.position.y < -100) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    }
  }

  resetPosition() {
    let r = Math.random();

    if (r < 0.2) {
      this.position = createVector(
        Math.random() * width,
        Math.random() * height
      );
      //this.position = createVector(0, Math.random() * height);
    } else if (r > 0.9) {
      this.position = createVector(0, Math.random() * height);
    } else {
      this.position = createVector(0, jetArr[0] + Math.random() * 160 - 80);
    }
    this.velocity.mult(0);
    this.prevPosition = this.position;
    for(let p=0; p<this.trailLength; p++) {
      this.positions[p] = this.position;
    }
    this.wind = this.calculateWind2();
  }
}

/* - - - */

class Repeller {
  constructor(m, x, y) {
    this.position = createVector(x, y);
    this.mass = m;
    this.g = 1.5;
  }

  repel(p) {
    let copyPosition = this.position.copy();
    let force = copyPosition.sub(p.position);
    let d = force.mag();
    d = constrain(d, 20, 300);
    force.normalize();
    let n = 6; //4 // increase the n value to make bigger avoidance of circles,
    if (challengeMode) {
      if (this.position.y < 320) {
        n *= challengeIncreaser;
      } else {
        n *= challengeDecreaser;
      }
    }
    let strength = (this.g * this.mass * p.mass) / ((d * d) / n);
    force.mult(strength / strengthDivider);
    force.mult(-1);
    return force;
  }

  show() {
    noStroke();
    fill(255, 0, 0, 100);
    if (challengeMode) {
      if (this.position.y < 320) {
        fill(0, 0, 255, 100);
      }
    }
    ellipse(this.position.x, this.position.y, this.mass / strengthDivider);
  }
}

/* - - - */

class cloud {
  constructor() {
    this.position = createVector(Math.random() * width, Math.random() * height);
    this.prevPosition = this.position;
    let rx = Math.random() * 2 - 1;
    if (rx == 0) {
      rx = 1;
    }
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = 3; //random(1,3);
    //
    this.wind = this.calculateWind2(); //createVector(random(0.5,3),0);
  }

  applyForce(force) {
    let v = force.copy();
    let f = v.div(this.mass);
    this.acceleration.add(f);
  }

  separate(ps) {
    let sepDist = 16.0;
    let steer = createVector(0, 0);
    let count = 0;

    for (let i = 0; i < ps.length; i++) {
      let d = p5.Vector.dist(this.position, ps[i].position);
      if (d > 0 && d < sepDist) {
        let diff = p5.Vector.sub(this.position, ps[i].position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
        //
        if (ps[i].velocity > this.velocity) {
          this.velocity.add(ps[i].velocity.mult(0.5));
          //this.velocity.mult(1.01); // not good compared to above
          this.velocity.limit(10);
        }
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(10); // max speed
      steer.sub(this.velocity);
      steer.limit(0.3); // max steering force
    }
    return steer;
  }

  update() {
    this.prevPosition = this.position.copy();
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
    let d = dist(
      this.position.x,
      this.position.y,
      this.position.x,
      jetArr[round(this.position.x)]
    );
    let f = (height - d) / height;
    f *= f * 3;
    w.mult(f);
    //console.log(round(d));
    return w;
  }

  calculateWind2() {
    let w = createVector(1.0, 0);
    let d = dist(
      this.position.x,
      this.position.y,
      this.position.x,
      jetArr[round(this.position.x)]
    );
    let f = (height - d) / height;
    f *= f * 3;
    w.mult(f);
    //console.log(round(d));
    return w;
  }

  show() {
    //fill(255,this.alpha);
    //noStroke();
    //stroke(255,this.alpha);
    //ellipse(this.position.x, this.position.y, this.mass );

    tint(255,255 - 255*this.position.x/(width/4));
    image(cloudImage, this.position.x, this.position.y);
    /*for (let i = 0; i < 100; i++) {
      stroke(255, 255 - (255 * this.position.x) / (width / 2.5));
      point(
        this.position.x + random(-10, 10),
        this.position.y + random(-10, 10)
      );
    }*/
  }

  finished() {
    return this.alpha < 0;
  }

  checkEdges() {
    if (this.position.x > width+500) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    } else if (this.position.x < -500) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    } else if (this.position.y > height+500) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    } else if (this.position.y < -500) {
      //this.position = createVector(random(width),random(height));
      //this.position = createVector(0,random(height));
      //this.position = createVector(0,jetArr[0]+random(-50,50));
      //this.velocity.mult(0);
      //this.prevPosition = this.position;
      this.resetPosition();
    }
  }

  resetPosition() {
    let r = Math.random();

    /*if (r < 0.2) {
      this.position = createVector(
        Math.random() * width,
        Math.random() * height
      );
      //this.position = createVector(0, Math.random() * height);
    } else if (r > 0.9) {
      this.position = createVector(0, Math.random() * height);
    } else {
      this.position = createVector(0, jetArr[0] + Math.random() * 160 - 80);
    }*/
    this.position = createVector(0, jetArr[0]);
    this.velocity.mult(0);
    this.prevPosition = this.position;
    this.wind = this.calculateWind2();
  }
}
