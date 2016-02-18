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
