let soundFile, fft; // Sound file and FFT object for audio analysis (p5.js) https://p5js.org/reference/#/p5.FFT
let playButton; 
let rotationAngle = 0; // Rotation angle for the orange ring and small balls

// Constants
let circleDiameter = 180; // Diameter of the main circle
let spacing = 35; 
let offsetX = -10; // Offset to move all circles to the left
let offsetY = -20; // Offset to move all circles upward
let specialCircleColor = [255, 255, 0]; 
let redLineStrokeWeight = 0.8; 
let redLineSpikes = 130; // Number of spikes in the red line
let goldLineStrokeWeight = 3; 
let goldLineSpikes = 16; // Number of spikes in the gold line

// CirclePattern class definition
class CirclePattern {
  constructor(x, y, diameter, colors, startAngle, hasArc, styleType) {
    this.x = x; 
    this.y = y; 
    this.d = diameter; // Diameter of the circle
    this.colors = colors; 
    this.startAngle = startAngle; // Starting angle for arcs
    this.hasArc = hasArc; // Boolean indicating if the circle has an arc （p5.js）// https://p5js.org/reference/#/p5/arc
    this.styleType = styleType; // Style type of the circle pattern
    this.isSpecial = false; // Indicates if the circle is a special circle
  }

  // Draws the circle pattern with various styles.
  draw(spectrumValue, rotationAngle) {
    let radii = [this.d, this.d * 0.55, this.d * 0.5, this.d * 0.25, this.d * 0.15, this.d * 0.1, this.d * 0.05];
    let scale = 1 + spectrumValue / 255; // Scale factor based on spectrum value
    radii = radii.map(r => r * scale); // Scale all radii （p5.js) https://p5js.org/reference/#/p5/map

    push(); // Save the current drawing style settings and transformations
    translate(this.x, this.y); // Move the origin to the circle's position
    if (this.isSpecial) {
      this.drawSpecialCirclePattern(radii); 
    } else {
      this.drawCirclePattern(radii); 
    }
    pop(); // Restore the original drawing style settings and transformations
  }

  // Draws the circle pattern.
  drawCirclePattern(radii) {
    for (let i = 0; i < radii.length; i++) {
      fill(this.colors[i % this.colors.length]); 
      ellipse(0, 0, radii[i], radii[i]); 
      if (i == 0) {
        fillDotsOnCircle(0, 0, radii[0] / 2, radii[1] / 2); // Fill dots on the outer circle
      }
      if (i == 2 && i + 1 < radii.length) {
        if (this.styleType === 'goldZigzag') {
          drawGoldZShape(0, 0, radii[2] / 2, radii[3] / 2); // Draw gold zigzag pattern
        } else if (this.styleType === 'multiLayeredRings') {
          drawMultiLayeredRings(0, 0, radii[2] / 2, radii[3] / 2); // Draw multi-layered rings
        }
      }
      if (this.styleType === 'multiLayeredRings' && i == 3 && i + 1 < radii.length) {
        drawGreenLayeredRings(0, 0, radii[3] / 2, radii[4] / 2); // Draw green layered rings
      }
    }
  }

  // Draws the special circle pattern.
  drawSpecialCirclePattern(radii) {
    fill(specialCircleColor); // Set fill color for special circle
    ellipse(0, 0, radii[0], radii[0]); // Draw the outermost circle

    for (let i = 1; i < radii.length; i++) {
      fill(this.colors[i % this.colors.length]); // Set fill color
      ellipse(0, 0, radii[i], radii[i]); // Draw ellipse for each radius
    }

    if (this.styleType === 'goldZigzag') {
      drawGoldZShape(0, 0, radii[2] / 2, radii[3] / 2); // Draw gold zigzag pattern
    } else if (this.styleType === 'multiLayeredRings') {
      drawMultiLayeredRings(0, 0, radii[2] / 2, radii[3] / 2); // Draw multi-layered rings
    }
  }
}

// Visualizer class definition
class Visualizer {
  constructor() {
    this.circles = []; // Array to hold circle patterns
  }

  // Initializes the circle patterns.
  init() {
    this.circles = []; // Clear existing circles
    let y = circleDiameter / 2; // Initial y-coordinate for the first circle
    while (y < height + circleDiameter) {
      let x = circleDiameter / 2; // Initial x-coordinate for the first circle in a row
      while (x < width + circleDiameter) {
        let angle = random(TWO_PI); // Random starting angle for the arc
        let hasArc = random() > 0.5; // Random boolean to decide if the circle has an arc
        let styleType = random(['goldZigzag', 'multiLayeredRings']); // Randomly select style type
        this.circles.push(new CirclePattern(
          x + offsetX, y + offsetY, circleDiameter, generateColors(), angle, hasArc, styleType
        )); // Add new CirclePattern to the circles array
        x += circleDiameter + spacing; // Update x-coordinate for the next circle in the row
      }
      y += circleDiameter + spacing; // Update y-coordinate for the next row of circles
    }

    this.selectSpecialCircles(); // Select special circles
  }

  // Selects special circles.
  selectSpecialCircles() {
    let selectedIndices = []; // Array to hold indices of special circles
    while (selectedIndices.length < 2) {
      let index = floor(random(this.circles.length)); // Randomly select an index
      if (!selectedIndices.includes(index)) {
        selectedIndices.push(index); // Add index to selectedIndices if not already present
      }
    }

    for (let i = 0; i < selectedIndices.length; i++) {
      this.circles[selectedIndices[i]].isSpecial = true; // Mark selected circles as special
    }
  }

  // Draws the visualizer.
  draw() {
    let spectrum = fft.analyze(); // Analyze the sound and get the spectrum array (p5.js) https://p5js.org/reference/#/p5.FFT and (you tube tutoria) https://www.youtube.com/watch?v=2O3nm0Nvbi4&list=PLRqwX-V7Uu6aFcVjlDAkkGIixw70s7jpW&index=11
    let maxLevel = Math.max(...spectrum); // Get the maximum level from the spectrum array

    // Calculate rotation angle based on audio data
    rotationAngle += maxLevel / 10000; // Adjust the rotation angle

    // Draw all circles and other patterns
    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].draw(spectrum[i % spectrum.length], rotationAngle); // Draw each circle pattern
    }

    // Draw orange rings and patterns
    drawOrangeCircles(this.circles); // Draw orange rings around the circles

    for (let i = 0; i < this.circles.length; i++) {
      drawPatternOnRing(this.circles[i].x, this.circles[i].y, this.circles[i].d / 2 + 15, rotationAngle, spectrum); // Draw pattern on each ring
    }

    // Draw red lines in the special circles
    drawRedLinesInSpecialCircles(this.circles); // Draw red lines in special circles

    // Draw pink arcs on top of everything else
    for (let i = 0; i < this.circles.length; i++) {
      if (this.circles[i].hasArc) {
        drawArcThroughCenter(this.circles[i].x, this.circles[i].y, this.circles[i].d / 2, this.circles[i].startAngle, spectrum[i % spectrum.length]);
      }
    }
  }
}

let visualizer = new Visualizer(); // Create a Visualizer instance

// Preload function to load the sound file
function preload() {
  soundFile = loadSound('assets/655396__sergequadrado__middle-east.wav'); // Load the sound file
}
// Setup function to initialize the canvas and start the sound
function setup() {
  createCanvas(windowWidth, windowHeight); // Create a canvas that covers the entire window
  fft = new p5.FFT(); // Create an FFT object for audio analysis (p5.js) https://p5js.org/reference/#/p5.FFT
  soundFile.loop(); // Start the sound file in a loop

  playButton = createButton('Pause'); // Create a button to pause/play the sound  ( you tube tutorial ) https://www.youtube.com/watch?v=YcezEwOXun4&list=PLRqwX-V7Uu6aFcVjlDAkkGIixw70s7jpW&index=2
  playButton.position(10, 10); 
  playButton.mousePressed(togglePlay); // Attach the togglePlay function to the button's mousePressed event

  visualizer.init(); // Initialize the visualizer
}

// Draw function to render the visualization
function draw() {
  background(50, 100, 150); // Set the background color
  visualizer.draw(); // Draw the visualizer
}

// Window resized function to adjust the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Resize the canvas to match the new window size (p5.js) https://p5js.org/reference/#/p5/windowResized
  visualizer.init(); // Re-initialize the visualizer
}

// Function to toggle play/pause of the sound
function togglePlay() {
  if (soundFile.isPlaying()) {
    soundFile.pause(); // Pause the sound file
    playButton.html('Play'); // Change button text to "Play" (p5.js) https://p5js.org/reference/#/p5.Element/html
  } else {
    soundFile.loop(); // Play the sound file in a loop
    playButton.html('Pause'); // Change button text to "Pause"
  }
}

// Draws orange circles around the main circles.
function drawOrangeCircles(circles) {
  for (let i = 0; i < circles.length; i++) {
    let c = circles[i];
    let arcRadius = c.d / 2 + 15; // Radius for the orange circle
    stroke(255, 165, 0); 
    strokeWeight(2.5); 
    noFill(); 
    ellipse(c.x, c.y, arcRadius * 2, arcRadius * 2); // Draw the orange circle
  }
}

// Draws a pattern on a ring based on FFT data.
function drawPatternOnRing(cx, cy, radius, rotation, spectrum) {
  push(); // Save the current drawing style settings and transformations
  translate(cx, cy); // Move the origin to the center of the circle
  rotate(rotation); // Rotate the canvas
  translate(-cx, -cy); // Move the origin back

  let numPatterns = 8; // Number of patterns to draw on the ring
  let angleStep = TWO_PI / numPatterns; // Angle between each pattern

  for (let i = 0; i < numPatterns; i++) {
    let angle = i * angleStep;
    let x = cx + cos(angle) * radius; 
    let y = cy + sin(angle) * radius; 
    let shapeType = floor(map(spectrum[i % spectrum.length], 0, 255, 0, 3)); // Determine the shape type based on the spectrum value (p5.js) https://p5js.org/reference/#/p5/floor

    fill(200, 0, 0); 
    if (shapeType == 0) {
      ellipse(x, y, 10, 10); 
    } else if (shapeType == 1) {
      rect(x - 5, y - 5, 10, 10); 
    } else if (shapeType == 2) {
      triangle(x, y - 5, x - 5, y + 5, x + 5, y + 5); // Draw a triangle
    }

    let angleOffset = angleStep / 3; // Offset angle for the next pattern
    let xOffset = cx + cos(angle + angleOffset) * radius; 
    let yOffset = cy + sin(angle + angleOffset) * radius; 
    fill(255, 255, 0); 
    if (shapeType == 0) {
      ellipse(xOffset, yOffset, 6, 6); 
    } else if (shapeType == 1) {
      rect(xOffset - 3, yOffset - 3, 6, 6); 
    } else if (shapeType == 2) {
      triangle(xOffset, yOffset - 3, xOffset - 3, yOffset + 3, xOffset + 3, yOffset + 3); // Draw a small triangle
    }

    let angleOffset2 = angleStep / 3 * 2; // Second offset angle for the next pattern
    let xOffset2 = cx + cos(angle + angleOffset2) * radius; 
    let yOffset2 = cy + sin(angle + angleOffset2) * radius; 
    fill(0); // Set fill color to black
    if (shapeType == 0) {
      ellipse(xOffset2, yOffset2, 21, 21); // Draw a black ring
      fill(255); // Set fill color to white
      ellipse(xOffset2, yOffset2, 7, 7); // Draw inner white circle
    } else if (shapeType == 1) {
      rect(xOffset2 - 10.5, yOffset2 - 10.5, 21, 21); 
      fill(255); 
      rect(xOffset2 - 3.5, yOffset2 - 3.5, 7, 7); // Draw inner white square
    } else if (shapeType == 2) {
      triangle(xOffset2, yOffset2 - 10.5, xOffset2 - 10.5, yOffset2 + 10.5, xOffset2 + 10.5, yOffset2 + 10.5); // Draw a black triangle
      fill(255); 
      triangle(xOffset2, yOffset2 - 3.5, xOffset2 - 3.5, yOffset2 + 3.5, xOffset2 + 3.5, yOffset2 + 3.5); // Draw inner white triangle
    }
  }

  pop(); // Restore the original drawing style settings and transformations
}

// Draws an arc through the center of a circle.
function drawArcThroughCenter(x, y, radius, startAngle, spectrumValue) {
  push(); // Save the current drawing style settings and transformations
  let baseColor = color(255, 20, 147); // Original pink color
  let shadowColor = lerpColor(baseColor, color(0), 0.25); // Generate darker pink shadow (p5.js) https://p5js.org/reference/#/p5/lerpColor

  strokeWeight(6); 
  noFill(); 

  let endAngle = startAngle + map(spectrumValue, 0, 255, -PI / 2, PI / 2); // Calculate end angle based on spectrum value

  stroke(shadowColor); // Set stroke color to shadow color
  arc(x, y + 3, radius * 2, radius * 2, startAngle, endAngle); // Draw shadow arc

  stroke(baseColor); // Set stroke color to base color
  arc(x, y, radius * 2, radius * 2, startAngle, endAngle); // Draw base arc

  pop(); // Restore the original drawing style settings and transformations
}

// Draws red lines in special circles.
function drawRedLinesInSpecialCircles(circles) {
  let specialCircles = circles.filter(c => c.isSpecial); // Get only special circles
  for (let i = 0; i < specialCircles.length; i++) {
    let c = specialCircles[i];
    drawRedLine(c.x, c.y, c.d / 2, c.d * 0.55 / 2); // Draw red lines within each special circle
  }
}

// Draws a red line within a circle.
function drawRedLine(cx, cy, outerRadius, innerRadius) {
  push(); // Save the current drawing style settings and transformations
  stroke(255, 0, 0); 
  strokeWeight(redLineStrokeWeight); 
  noFill(); 

  let numSpikes = redLineSpikes; // Number of spikes in the red line
  let angleStep = TWO_PI / numSpikes; // Angle between each spike

  beginShape(); // Begin drawing the shape
  for (let i = 0; i < numSpikes; i++) {
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * outerRadius; // x-coordinate for the outer vertex
    let outerY = cy + sin(angle) * outerRadius; // y-coordinate for the outer vertex
    vertex(outerX, outerY); // Add outer vertex to the shape

    let innerAngle = angle + angleStep / 2; // Angle for the inner vertex
    let innerRadiusAdjust = innerRadius + (outerRadius - innerRadius) * 0.3; // Adjusted inner radius
    let innerX = cx + cos(innerAngle) * innerRadiusAdjust; //
    let innerY = cy + sin(innerAngle) * innerRadiusAdjust; // y-coordinate for the inner vertex
    vertex(innerX, innerY); // Add inner vertex to the shape
  }
  endShape(CLOSE); // Close the shape

  pop(); // Restore the original drawing style settings and transformations
}

// Draws a gold zigzag shape in the circle.
function drawGoldZShape(cx, cy, thirdRadius, fourthRadius) {
  push(); // Save the current drawing style settings and transformations
  stroke(212, 175, 55); 
  strokeWeight(goldLineStrokeWeight); 
  noFill(); 

  let numSpikes = goldLineSpikes; // Number of spikes in the gold zigzag
  let angleStep = TWO_PI / numSpikes; // Angle between each spike

  beginShape(); // Begin drawing the shape
  for (let i = 0; i < numSpikes; i++) {
    let angle = i * angleStep;
    let outerX = cx + cos(angle) * thirdRadius; // x-coordinate for the outer vertex
    let outerY = cy + sin(angle) * thirdRadius; // y-coordinate for the outer vertex
    vertex(outerX, outerY); // Add outer vertex to the shape

    let innerAngle = angle + angleStep / 2; // Angle for the inner vertex
    let innerRadiusAdjust = fourthRadius + (thirdRadius - fourthRadius) * 0.3; // Adjusted inner radius
    let innerX = cx + cos(innerAngle) * innerRadiusAdjust; // x-coordinate for the inner vertex
    let innerY = cy + sin(innerAngle) * innerRadiusAdjust; // y-coordinate for the inner vertex
    vertex(innerX, innerY); // Add inner vertex to the shape
  }
  endShape(CLOSE); // Close the shape

  pop(); // Restore the original drawing style settings and transformations
}

// Draws multi-layered rings in the circle.
function drawMultiLayeredRings(cx, cy, thirdRadius, fourthRadius) {
  push(); // Save the current drawing style settings and transformations
  let colors = [
    color(255, 0, 121), 
    color(0, 179, 255)  
  ];
  strokeWeight(3); 
  noFill(); 
  let numRings = 5; // Number of rings
  let radiusStep = (thirdRadius - fourthRadius) / numRings; // Radius step between rings

  for (let j = 0; j < numRings; j++) {
    stroke(colors[j % colors.length]); // Set stroke color for each ring
    ellipse(cx, cy, thirdRadius * 2 - j * radiusStep, thirdRadius * 2 - j * radiusStep); // Draw the ring
  }

  pop(); // Restore the original drawing style settings and transformations
}

// Draws green layered rings in the circle.
function drawGreenLayeredRings(cx, cy, fourthRadius, fifthRadius) {
  push(); // Save the current drawing style settings and transformations
  let colors = [
    color(68, 106, 55), // Color for the first ring
    color(168, 191, 143) // Color for the second ring
  ];
  strokeWeight(3); 
  noFill(); 
  let numRings = 4; // Number of rings
  let radiusStep = (fourthRadius - fifthRadius) / numRings; // Radius step between rings

  for (let j = 0; j < numRings; j++) {
    stroke(colors[j % colors.length]); 
    ellipse(cx, cy, fourthRadius * 2 - j * radiusStep, fourthRadius * 2 - j * radiusStep); // Draw the ring
  }

  pop(); // Restore the original drawing style settings and transformations
}

// Fills dots on a circle.
function fillDotsOnCircle(cx, cy, outerRadius, innerRadius) {
  fill(255); 
  let numCircles = 6; // Number of circles to draw
  let dotSize = 3.5; // Size of each dot
  let radiusStep = (outerRadius - innerRadius) / numCircles; // Radius step between circles

  for (let j = 0; j < numCircles; j++) {
    let currentRadius = innerRadius + j * radiusStep + radiusStep / 2; // Current radius for the circle
    let numDots = Math.floor(TWO_PI * currentRadius / (dotSize * 3)); // Number of dots on the current circle
    let angleStep = TWO_PI / numDots; // Angle step between dots
    for (let i = 0; i < numDots; i++) {
      let angle = i * angleStep;
      let x = cx + cos(angle) * currentRadius; // x-coordinate for the dot
      let y = cy + sin(angle) * currentRadius; // y-coordinate for the dot
      ellipse(x, y, dotSize, dotSize); // Draw the dot
    }
  }
}

// Generates random colors.
function generateColors() {
  return [
    [random(255), random(255), random(255)], 
    [random(255), random(255, 255)],         
    [random(255), random(255, 255)]          
  ];
}
