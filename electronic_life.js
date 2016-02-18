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
