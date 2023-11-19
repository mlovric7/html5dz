let myGamePiece;
// Create 20 asteroids initially
let numberOfAsteroids = 20

let startTime; // Variable to store the start time
let bestTime = localStorage.getItem('bestTime') || 0; // Retrieve the best time from local storage or set it to 0 if not present

// Creates a canvas that represents the game area
const myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        // Create a canvas over the whole window (6 is for the margin on both sides (3))
        this.canvas.id = "gameCanvas";
        this.canvas.width = window.innerWidth - 6;
        this.canvas.height = window.innerHeight - 6;
        this.context = this.canvas.getContext("2d");
        // Insert the canvas into html
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        // Set to update game area every 20 milliseconds
        this.updateInterval = setInterval(updateGameArea, 20);
        // Generate more asteroids every 5 seconds
        this.asteroidsInterval = setInterval(createAsteroids, 5000)
        writeTimeText()
    },
    stop : function() {
        // Stop the intervals
        clearInterval(this.updateInterval);
        clearInterval(this.asteroidsInterval);
    },
    clear : function() {
        // Clear the canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

function startGame() {
    // Set the start time when the game begins
    startTime = new Date().getTime();
    // Create initial objects
    createPlayer();
    createAsteroids();
    // Start the game flow
    myGameArea.start();

    // Add event listeners for arrow keys
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

function createPlayer() {
    console.log(this.canvas)
    // Create player in the center of the canvas
    const canvasCenterX = (window.innerWidth - 6) / 2
    const canvasCenterY = (window.innerHeight - 6) / 2

    // Dimensions of the player rect
    const pieceWidth = 40;
    const pieceHeight = 40;

    myGamePiece = new component(pieceWidth, pieceHeight, "red", canvasCenterX, canvasCenterY, 'player', 0, 0);
}

let asteroids = [];

function createAsteroids() {
    console.log(numberOfAsteroids)
    const max_distance = 1500

    // Create the given number of asteroids
    for (let i = 0; i < numberOfAsteroids; i++) {
        // Set a random size of the asteroid between 20 and 100
        const asteroidSize = Math.random() * 80 + 20;

        // Set random x pos between -max_distance and window.innerWidth + max_distance
        const x = Math.random() * (window.innerWidth + max_distance*2) - max_distance;

        let y;
        // Adjust y-coordinate based on x-coordinate range
        if (x < -100 || x > window.innerWidth + 100) {
            // If x is outside the screen, y can be anywhere just like we generated x
            y = Math.random() * (window.innerHeight + max_distance*2) - max_distance; // Adjust the range as needed
        } else {
            // If x is in the screen, y should be outside (pick randomly if it goes top or bottom)
            const innerYRange = Math.random() < 0.5 ? -max_distance : window.innerHeight + 100;
            y = Math.random() * (max_distance-100) + innerYRange; // Adjust the range as needed
        }

        // Set the speed of the asteroid
        let speed_x = getSpeedForPosition(x);
        let speed_y = getSpeedForPosition(y, true);


        asteroids.push(new component(asteroidSize, asteroidSize, getRandomGray(), // Size and color of the asteroid
            x, y, 'asteroid', // Type and initial position
            speed_x, speed_y)); // Speed of the asteroid
    }
    numberOfAsteroids += 1; // Add 1 more asteroid to the generation each time
}

// Generate speed randomly based on the position, so it tends to go towards the visible part, never away from it
function getSpeedForPosition(position, inverted = false) {
    // Default speed is between 0.5 and 4.5
    const max_speed = 4
    const min_speed = 0.5
    let speed;
    if (position < 0) {
        // If position is to the left of the canvas, set speed to a positive value
        speed = Math.random() * max_speed + min_speed; // Random speed between 0.5 and 5.5
    } else if (position > window.innerWidth) {
        // If position is to the right of the canvas, set speed to a negative value
       speed = -(Math.random() * max_speed + min_speed); // Random speed between -0.5 and -5.5
    } else {
        // If position is anywhere in the canvas, set speed to a random speed positive or negative
        speed = Math.random() < 0.5 ? -(Math.random() * max_speed + 0.5) : Math.random() * max_speed + min_speed;
    }
    return inverted ? -speed : speed;
}

// Get a random gray color (not too dark, not too light)
function getRandomGray(min = 90, max = 180) {
    let randomValue;
    // Generate a random number between min and max
    randomValue = Math.floor(Math.random() * (max - min + 1)) + min;

    // Create a gray color
    return `rgb(${randomValue}, ${randomValue}, ${randomValue})`;
}

function component(width, height, color, x, y, type, speed_x, speed_y) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speed_x = speed_x;
    this.speed_y = speed_y;
    this.x = x;
    this.y = y;
    this.update = function() {
        let ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = color;
        // Shadow
        ctx.shadowBlur = 20
        ctx.shadowColor = color
        // Draw the object
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }
    this.newPos = function() {
        // Make the player rectangle come on the other side if it goes outside the canvas
        if(this.type === 'player') {
            if (this.x - this.width / 2 > myGameArea.context.canvas.width) {
                this.x = 0 - this.width / 2;
            } else if (this.x + this.width / 2 < 0) {
                this.x = myGameArea.context.canvas.width + this.width / 2;
            }

            if (this.y - this.height / 2 > myGameArea.context.canvas.height) {
                this.y = 0 - this.height / 2;
            } else if (this.y + this.height / 2 < 0) {
                this.y = myGameArea.context.canvas.height + this.height / 2;
            }
        }
        // Update the position based on the speed of the object
        this.x += this.speed_x;
        this.y -= this.speed_y;
    }
}

// Player controls (adds/resets speed based on the key press)
function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowLeft':
            myGamePiece.speed_x = -4;
            break;
        case 'ArrowRight':
            myGamePiece.speed_x = 4;
            break;
        case 'ArrowUp':
            myGamePiece.speed_y = 4;
            break;
        case 'ArrowDown':
            myGamePiece.speed_y = -4;
            break;
    }
}

function handleKeyUp(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            myGamePiece.speed_x = 0;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            myGamePiece.speed_y = 0;
            break;
    }
}

// Function to check for collision between two objects
function checkCollision(obj1, obj2) {
    // Calculate the top left point of the objects
    const obj1_left = obj1.x - obj1.width/2
    const obj1_top = obj1.y - obj1.height/2

    const obj2_left = obj2.x - obj2.width/2
    const obj2_top = obj2.y - obj2.height/2

    // Check if there is a collision between objects
    return (
        obj1_left <= obj2_left + obj2.width &&
        obj1_left + obj1.width >= obj2_left &&
        obj1_top <= obj2_top + obj2.height &&
        obj1_top + obj1.height >= obj2_top
    );
}

function updateGameArea() {
    myGameArea.clear();
    // Calculate elapsed time
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    // Update asteroids positions
    asteroids.forEach((asteroid) => asteroid.newPos());
    asteroids.forEach((asteroid) => asteroid.update());
    // Update player position
    myGamePiece.newPos();
    myGamePiece.update();

    // Check for collisions with the player
    asteroids.forEach((asteroid) => {
        if (checkCollision(myGamePiece, asteroid)) {
            console.log("Collision with asteroid!");
            // Check if the current time is better than the stored best time
            if (elapsedTime > bestTime) {
                // Update best time
                bestTime = elapsedTime;
                localStorage.setItem('bestTime', bestTime);
                writeNewBestTime()
            }
            // Stop the game on collision
            myGameArea.stop();
        }
    });
    writeTimeText(elapsedTime)
}

// Writes the time info text in the top right (current and best time)
function writeTimeText(elapsedTime = 0) {
    myGameArea.context.save()
    myGameArea.context.fillStyle = 'white';
    myGameArea.context.font = '20px Georgia'
    myGameArea.context.textAlign = 'right'
    writeTime(bestTime, 30, 'Najbolje Vrijeme: ')

    writeTime(elapsedTime, 60, 'Vrijeme: ')
    myGameArea.context.restore()
}

// Writes the time
function writeTime(time, y, text) {
    let minutes = Math.floor(time / (60 * 1000));
    let seconds = Math.floor((time % (60 * 1000)) / 1000);
    let milliseconds = time % 1000;
    myGameArea.context.fillText(
        text +
        padNumber(minutes, 2) + ":" +
        padNumber(seconds, 2) + "." +
        padNumber(milliseconds, 3),
        myGameArea.canvas.width - 30,
        y);
}

// Writes the message if the new best time was achieved
function writeNewBestTime() {
    myGameArea.context.save()
    myGameArea.context.fillStyle = 'white';
    myGameArea.context.font = '40px Georgia'
    myGameArea.context.textAlign = 'center'
    let minutes = Math.floor(bestTime / (60 * 1000));
    let seconds = Math.floor((bestTime % (60 * 1000)) / 1000);
    let milliseconds = bestTime % 1000;
    myGameArea.context.fillText('Novo najbolje vrijeme: ' +
        padNumber(minutes, 2) + ":" +
        padNumber(seconds, 2) + "." +
        padNumber(milliseconds, 3),
        myGameArea.canvas.width/2,
        myGameArea.canvas.height/2);
    myGameArea.context.restore()
}

// Function to pad a number with zeros to the specified length
function padNumber(number, length) {
    return String(number).padStart(length, '0');
}