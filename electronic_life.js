var plan = ["############################",
            "#      #    #      o   *  ##",
            "#                          #",
            "#    *     #####           #",
            "##         # * #    ##     #",
            "###           ##     #     #",
            "#           ###      #     #",
            "#   ####                   #",
            "#   ##       o       *     #",
            "# o  #         o       ### #",
            "#    #  *            *     #",
            "############################"];


// Object to represent a particular point in the world.
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
// Method to sum two Vectors together
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
// Check whether vectors equal
Vector.prototype.equals = function(other) {
  return (this.x === other.x && this.y === other.y);
};
// Return difference of two Vectors
Vector.prototype.minus = function(other) {
  return new Vector(this.x - other.x, this.y - other.y);
};

// Object to represent world grid.
function Grid(width, height) {
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}
// Validate that the specified vector is within the world grid.
Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.width &&
         vector.y >= 0 && vector.y < this.height;
};
// Return the grid item at the specified vector location.
Grid.prototype.get = function(vector) {
  return this.space[vector.x + this.width * vector.y];
};
// Set the grid item at the specified vector location.
Grid.prototype.set = function(vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
};
// A forEach method which calls the given function for each element
// in the grid that isn't either null or undefined.
Grid.prototype.forEach = function(f, context) {
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var value = this.space[x + y * this.width];
      if (value !== null)
        f.call(context, value, new Vector(x, y));
    }
  }
};

function relativeVectors(array) {
  var currentPosition = array[array.length - 1];
  return array.map(function(currentValue) {
    return currentValue.minus(currentPosition);
  }, this);
}

// Define compass directions in terms of a Vector.
var directions = {
  "n":  new Vector( 0, -1),
  "ne": new Vector( 1, -1),
  "e":  new Vector( 1,  0),
  "se": new Vector( 1,  1),
  "s":  new Vector( 0,  1),
  "sw": new Vector(-1,  1),
  "w":  new Vector(-1,  0),
  "nw": new Vector(-1, -1)
};

// Get a random Vector element from an array. Take an optional array of elements
// to exclude if possible.
function randomElement(array, exclude) {
  var finalArray = [];
  // If only one argument can select from any element.
  if (arguments.length <= 1) {
    finalArray = array;
  } else {
    // Exclude elements to select from using exclude function argument.
    array.forEach(function(elementToCheck) {
      var match = false;
      exclude.forEach(function(elementToExclude) {
        if (directions[elementToCheck].equals(elementToExclude)) {
          match = true;
        }
      }, this);
      // If no matches then append vector to array
      if (!match) finalArray.push(elementToCheck);
    }, this);
    // If everything is excluded then choose any value from array argument.
    if (finalArray.length === 0) {
      finalArray = array;
    }
  }
  return finalArray[Math.floor(Math.random() * finalArray.length)];
}
// Put all direction names into an array. Cannot use Object.keys() as there are no
// guarantees on the order of the properties being returned (and neither can it
// sorted alphabetically afterwards).
var directionNames = "n ne e se s sw w nw".split(" ");

// Return the opposite direction to the argument. E.g. "s" returns "n".
function oppositeDirection(direction) {
  var index = directionNames.indexOf(direction);
  if (index < 1) {
    console.log("oppositeDirection(): Invalid direction.");
    return;
  }
  index += 4;
  if (index > directionNames.length - 1) {
    index -= 8;
  }
}

// Define a bouncing critter object.
function BouncingCritter() {
  this.direction = randomElement(directionNames);
}
// Find an empty space to move to.
BouncingCritter.prototype.act = function(view) {
  if (view.look(this.direction) != " ")
  // The "s" is to prevent a null return if the critter is trapped.
  this.direction = view.find(" ") || "s";
  return {type: "move", direction: this.direction};
};

// Convert a character from the grid into an element. Return the corresponding
// element or null if empty space.
function elementFromChar(legend, ch) {
  if (ch == " ")
    return null;
  var element = new legend[ch]();
  element.originChar = ch;
  return element;
}

// Create the World object and set up grid based on arguments map and legend.
function World(map, legend) {
  var grid = new Grid(map[0].length, map.length);
  this.grid = grid;
  this.legend = legend;

  map.forEach(function(line, y) {
    for (var x = 0; x < line.length; x++)
      grid.set(new Vector(x, y),
               elementFromChar(legend, line[x]));
  });
}

// Convert from an elememnt back to a character.
function charFromElement(element) {
  if (element === null)
    return " ";
  else
    return element.originChar;
}
// Convert the grid into the visual string representation of the world.
World.prototype.toString = function() {
  var output = "";
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      output += charFromElement(element);
    }
    output += "\n";
  }
  return output;
};
// Convert the grid into HTML compatible representation. This involves newlines
// as <br> and spaces as &nbsp.
World.prototype.toHTML = function() {
  var output = "";
  var char = "";
  for (var y = 0; y < this.grid.height; y++) {
    for (var x = 0; x < this.grid.width; x++) {
      var element = this.grid.get(new Vector(x, y));
      char = charFromElement(element);
      if (char === " ") {
        output += "&nbsp";
      } else {
        output += char;
      }
    }
    output += "<br>";
  }
  return output;
};
// Give each critter a turn to act. Keep track of each critter that has had a
// turn so we don't move it twice (it may move into a grid spot we check later.)
World.prototype.turn = function() {
  var acted = [];
  this.grid.forEach(function(critter, vector) {
    if (critter.act && acted.indexOf(critter) === -1) {
      acted.push(critter);
      this.letAct(critter, vector);
    }
  }, this);
};
// Let the critter act. The argument vector is the location of the critter.
World.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  if (action && action.type == "move") {
    var dest = this.checkDestination(action, vector);
    if (dest && this.grid.get(dest) === null) {
      this.grid.set(vector, null);
      this.grid.set(dest, critter);
    }
  }
};
// Check the destination that the critter is moving to is valid.
World.prototype.checkDestination = function(action, vector) {
  if (directions.hasOwnProperty(action.direction)) {
    var dest = vector.plus(directions[action.direction]);
    if (this.grid.isInside(dest)) {
      return dest;
    } else {
      console.log("World.checkDestination(): Destination outside grid.");
      return;
    }
  }
  console.log("World.checkDestination(): Invalid direction.");
};

// The View object allows the critter to look around the world.
function View(world, vector) {
  this.world = world;
  this.vector = vector;
}
// Look in the specified direction. If the destination is outside the grid,
// a wall is returned.
View.prototype.look = function(dir) {
  var target = this.vector.plus(directions[dir]);
  if (this.world.grid.isInside(target))
    return charFromElement(this.world.grid.get(target));
  else
    return "#";
};
// Find characters in surrounding directions.
View.prototype.findAll = function(ch) {
  var found = [];
  for (var dir in directions)
    if (this.look(dir) == ch)
      found.push(dir);
  return found;
};
// Return a random element from the matched character surrounding the critter.
// Take an optional argument of an array of positions to exclude.
// If no matching characters then return null.
View.prototype.find = function(ch, excludeArray) {
  var found = this.findAll(ch);
  if (found.length === 0) return null;
  if (arguments.length <= 1) {
    return randomElement(found);
  }
  return randomElement(found, relativeVectors(excludeArray));
};

// Wall object. Given it's a wall, it doesn't do anything but sit there.
function Wall(){}

// Get a relative direction.
// dir: starting direction, e.g. "se"
// n: 45 degree increments. e.g. -2 is -90 degrees
function dirPlus(dir, n) {
  var index = directionNames.indexOf(dir);
  return directionNames[(index + n + 8) % 8];
}
// Define wall follower critter
function WallFollower() {
  this.dir = "s";
}
WallFollower.prototype.act = function(view) {
  var start = this.dir;
  if (view.look(dirPlus(this.dir, -3)) != " ")
    start = this.dir = dirPlus(this.dir, -2);
  while (view.look(this.dir) != " ") {
    this.dir = dirPlus(this.dir, 1);
    if (this.dir == start) break;
  }
  return {type: "move", direction: this.dir};
};

// LifelikeWorld is used to implement energy use
function LifelikeWorld(map, legend) {
  World.call(this, map, legend);
}
LifelikeWorld.prototype = Object.create(World.prototype);
LifelikeWorld.prototype.letAct = function(critter, vector) {
  var action = critter.act(new View(this, vector));
  var handled = action &&
    action.type in actionTypes &&
    actionTypes[action.type].call(this, critter,
                                  vector, action);
  if (!handled) {
    critter.energy -= 0.2;
    if (critter.energy <= 0)
      this.grid.set(vector, null);
  }
};

// Define action types for critters
var actionTypes = Object.create(null);
// Grow is used for plants.
actionTypes.grow = function(critter) {
  critter.energy += 0.5;
  return true;
};
actionTypes.move = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  if (dest === null ||
      critter.energy <= 1 ||
      this.grid.get(dest) !== null)
    return false;
  critter.energy -= 1;
  this.grid.set(vector, null);
  this.grid.set(dest, critter);
  return true;
};
actionTypes.eat = function(critter, vector, action) {
  var dest = this.checkDestination(action, vector);
  var atDest = dest !== null && this.grid.get(dest);
  if (!atDest || atDest.energy === null)
    return false;
  critter.energy += atDest.energy;
  this.grid.set(dest, null);
  return true;
};
actionTypes.reproduce = function(critter, vector, action) {
  var baby = elementFromChar(this.legend,
                             critter.originChar);
  var dest = this.checkDestination(action, vector);
  if (dest === null ||
      critter.energy <= 2 * baby.energy ||
      this.grid.get(dest) !== null)
    return false;
  critter.energy -= 2 * baby.energy;
  this.grid.set(dest, baby);
  return true;
};

// Plant critter.
// Start with a random energy level between 3 and 7.
// Will grow in surrounding areas and reproduce if there is empty space nearby.
function Plant() {
  this.energy = 3 + Math.random() * 4;
  this.originChar = "*";
}
Plant.prototype.act = function(view) {
  if (this.energy > 15) {
    var space = view.find(" ");
    if (space)
      return {type: "reproduce", direction: space};
  }
  if (this.energy < 20)
    return {type: "grow"};
};

// Plant eater critter.
// Roams the world and eats plants that it finds.
function PlantEater() {
  this.energy = 20;
  this.originChar = "o";
}
PlantEater.prototype.act = function(view) {
  var space = view.find(" ");
  if (this.energy > 60 && space)
    return {type: "reproduce", direction: space};
  var plant = view.find("*");
  if (plant)
    return {type: "eat", direction: plant};
  if (space)
    return {type: "move", direction: space};
};

// A slightly more intelligent plant eater.
// Tries to avoid previous four locations. Reproduces at higher energy levels.
function LessStupidPlantEater() {
  this.energy = 20;
  this.originChar = "o";
  this.previousLocations = [new Vector(0, 0)];
  PREVIOUS_LOCATION_HISTORY = 4;
}
LessStupidPlantEater.prototype.act = function(view) {
  var space = view.find(" ", this.previousLocations);
  if (this.energy > 200 && space)
    return {type: "reproduce", direction: space};
  var plant = view.find("*");
  if (plant)
    return {type: "eat", direction: plant};
  if (space) {
    this.addLocation(space);
    return {type: "move", direction: space};
  }
};
// Add a location to the location history
LessStupidPlantEater.prototype.addLocation = function(direction) {
    // Get most recent location.
    this.previousLocations.push(this.newLocation(direction));
    while (this.previousLocations.length > PREVIOUS_LOCATION_HISTORY) {
      this.previousLocations.shift();
    }
};
// Take a direction and return the resulting vector location.
LessStupidPlantEater.prototype.newLocation = function(direction) {
  var previousLocation = this.previousLocations[this.previousLocations.length - 1];
  return previousLocation.plus(directions[direction]);
};

var legend = {"o": LessStupidPlantEater,
              "*": Plant,
              "#": Wall};

var interval;
var world = new LifelikeWorld(plan, legend);

$(document).ready(function() {
  $("#start_stop_btn").click(function() {
    if($(this).html() === "Start") {
      interval = setInterval(stepWorld, 1000);
      $(this).html("Stop");
    } else {
      clearInterval(interval);
      $(this).html("Start");
    }
  });

  $("#reset_btn").click(function() {
    world = new LifelikeWorld(plan, legend);
  });
});

function stepWorld() {
    world.turn();
    $("#world").html(world.toHTML());
}
