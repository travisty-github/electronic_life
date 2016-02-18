var plan = ["############################",
            "#      #    #      o      ##",
            "#                          #",
            "#          #####           #",
            "##         #   #    ##     #",
            "###           ##     #     #",
            "#           ###      #     #",
            "#   ####                   #",
            "#   ##       o             #",
            "# o  #         o       ### #",
            "#    #                     #",
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

// Object to represent world grid.
function Grid(width, height) {
  this.space = new Array(width * height);
  this.width = width;
  this.height = height;
}
// Validate that the specified vector is within the world grid.
Grid.prototype.isInside = function(vector) {
  return vector.x >= 0 && vector.x < this.width &&
         vector.y >= 0 && vecotr.y < this.height;
};
// Return the grid item at the specified vector location.
Grid.prototype.get = function(vector) {
  return this.space[vector.x + this.width * vector.y];
};
// Set the grid item at the specified vector location.
Grid.prototype.set = function(vector, value) {
  this.space[vector.x + this.width * vector.y] = value;
};

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

// Get a random element from an array.
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}
// Put all direction names into an array. Cannot use Object.keys() as there are no
// guarantees on the order of the properties being returned (and neither can it
// sorted alphabetically afterwards).
var directionNames = "n ne e se s sw w nw".split(" ");
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
