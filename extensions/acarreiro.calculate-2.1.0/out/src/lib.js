"use strict";
var alphabet = "abcdefghijklmnopqrstuvwxyz";
var BASE = alphabet.length;
/**
 * Number of digits in the base-26 alphabet
 *
 * @export
 * @param {number} num the number to determine places for
 * @returns {number} a 1-based integer representing the number of places
 */
function numberOfPlaces(num) {
    var places = 1;
    while (num >= Math.pow(BASE, places)) {
        places++;
    }
    ;
    return places;
}
exports.numberOfPlaces = numberOfPlaces;
function indexToAlpha(index) {
    // index is 0-based
    if (index < BASE) {
        return alphabet[index];
    }
    var currentIndex = index - (BASE - 1);
    var places = numberOfPlaces(index) - 1;
    var output = [];
    // work our way back from the big number, assigning values as we go
    for (var i = places; i >= 0; i--) {
        var column = Math.pow(BASE, i);
        var chosenValue = Math.floor(currentIndex / column);
        // console.log(`col: ${column}, chosenValue ${index}`);
        output.push(chosenValue);
        currentIndex -= (chosenValue * column);
    }
    // output.shift();
    return output.map(function (v) { return alphabet[v]; }).join("");
}
exports.indexToAlpha = indexToAlpha;
/**

I could figure out how many letters we'd have at the beginning,
and then backfill "a"s, so we maintain a strict 0 => a mapping?

Would I do the same with numeric counting?

Or maybe give the option to?



abcdefghij
0123456789

  5
        5
  105
  10^2 10^1 10^0
  100  10   1
  1    0    5
  b    a    f


  54
  0 5  4

  284
  10^2 10^1 10^0
  100  10   1
  2    8    4


  0005
  aaaf
**/ 
//# sourceMappingURL=lib.js.map