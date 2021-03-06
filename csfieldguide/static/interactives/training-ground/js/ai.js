/**
 * AI contains all functions used by the AI to calculate, save, and update its neural net.
 */
class AI {

  constructor(initialSticks, initialSensitivity) {
    this.floor = 0;     // The lowest value the neural net percentages can individually reach
    this.ceiling = 100; // The highest value the neural net percentages can individually reach
    this.map;           // The AI neural net
    this.smartMap;      // A smart model neural net that the AI can train against
    this.randomMap;     // A default neural net that the AI can train against
    this.startingSticks = initialSticks;
    this.sticksLeft = initialSticks;
    this.sensitivity = initialSensitivity;
    this.moves = {};    // Hashmap that records the current game moves by the AI
    this.opponentMoves = {}; // Hashmap that records the current game moves by the AI (as an opponent)
  }

  /**
   * Initializes the AI neural net with an equal chance of choosing 1, 2, or 3,
   * and initializes the two model neural nets the AI can train against.
   */
  init() {
    this.map = {};
    this.smartMap = {};
    this.randomMap = {};
    var weight;
    for (var i = this.startingSticks; i > 0; i--) {
      this.map[i.toString()] = [i, 33.33, 33.33, 33.34];
      this.randomMap[i.toString()] = [i, 33.33, 33.33, 33.34];

      if (i < 5) {
        weight = 100;
      }
      else if (i < 9) {
        weight = 90;
      }
      else if (i < 13) {
        weight = 80;
      }
      else if (i < 17) {
        weight = 70;
      }
      else {
        weight = 60;
      }

      if (i%4 == 1) {
        this.smartMap[i.toString()] = [i, weight, (100-weight)/2, (100-weight)/2];
      }
      else if (i%4 == 2) {
        this.smartMap[i.toString()] = [i, (100-weight)/2, weight, (100-weight)/2];
      }
      else if (i%4 == 3) {
        this.smartMap[i.toString()] = [i, (100-weight)/2, (100-weight)/2, weight];
      }
      else {
        this.smartMap[i.toString()] = [i, 33.33, 33.33, 33.34];
      }
    }

    // Hard coded rules, cannot choose more sticks than are available
    this.map['2'] = [2, 50, 50, 0];
    this.map['1'] = [1, 100, 0, 0];
    this.smartMap['2'] = [2, 0, 100, 0];
    this.smartMap['1'] = [1, 100, 0, 0];
    this.randomMap['2'] = [2, 50, 50, 0];
    this.randomMap['1'] = [1, 100, 0, 0];
  }

  /**
   * Resets the AI for a new game
   */
  newGame() {
    this.moves = {};
    this.opponentMoves = {};
    this.sticksLeft = this.startingSticks;
  }

  /**
   * Simulates AI turn being taken, determines the number of sticks to remove based on
   * its neural net and records the decision.
   * 
   * @param {bool} isOpponent Whether or not this is the AI as an opponent
   */
  takeTurn(isOpponent) {

    // Random pick from weighted map of choices
    var num = this.chooseNum(this.map[this.sticksLeft.toString()]);

    if (num > this.sticksLeft) {
      num = this.sticksLeft;
    }

    var id = this.sticksLeft.toString();
    if (isOpponent) {
      this.opponentMoves[id] = num;
    } else {
      this.moves[id] = num;
    }
    return num;
  }

  /**
   * Simulates the practice bot taking it's turn, returns the number of sticks to remove.
   * 
   * @param {bool} useIntelligentBot Whether to use the smart neural map or random one
   */
  takeBotTurn(useIntelligentBot) {

    // Random pick from weighted map of choices
    if (useIntelligentBot) {
      var num = this.chooseNum(this.smartMap[this.sticksLeft.toString()]);
    } else {
      var num = this.chooseNum(this.randomMap[this.sticksLeft.toString()]);
    }

    if (num > this.sticksLeft) {
      num = this.sticksLeft;
    }

    return num;
  }

  /**
   * Updates the AI's neural net based on its decisions during the previous game
   * and the results of that game.
   * The AI, and AI as an opponent (if applicable) are treated separately
   */
  updateAI(playerWin) {
    var keys, key, cur_vals, spot;

    var change = this.sensitivity;
    if (playerWin) {
      change *= -1; // Decrement values for chosen moves
    }

    keys = Object.keys(this.moves);
    for (var i in keys) {
      key = keys[i];
      // If key is in map (should always be true) update map values
      if (key in this.map) {
        cur_vals = this.map[key];
        spot = this.moves[key];

        this.map[key] = this.calculateVals(cur_vals, spot, change);
        cur_vals = [];
      }
    }

    // This section will be almost entirely ignored if the AI was not the opponent
    // Order does not matter as the AI and opponent will always have different keys
    // (Because the number of sticks remaining is the key, and at least one stick is removed every time)

    change *= -1; // Set as opposite for the opponent's moves
    keys = Object.keys(this.opponentMoves);
    for (var j in keys) {
      key = keys[j];
      // If key is in map (should always be true) update map values
      if (key in this.map) {
        cur_vals = this.map[key];
        spot = this.opponentMoves[key];

        this.map[key] = this.calculateVals(cur_vals, spot, change);
        cur_vals = [];
      }
    }
  }

  /**
   * Takes the array corresponding to a specific number of sticks left in the AI neural net and 
   * updates it.
   *
   * @param {[int, int, int, int]} start_vals     an array from map for a specific sticksLeft value
   * @param {int} move                            the number (1, 2, or 3) that was chosen by the AI
   * @param {int} change                          the max change value
   * @return {[int, int, int, int]} new_vals      an updated array for a specific sticksLeft value
   */
  calculateVals(start_vals, move, change) {
    var new_vals = start_vals;

    // Calculate actual change
    // If the AI won, check against the ceiling, otherwise against the floor
    var check = (change > 0) ? this.ceiling : this.floor;


    // The change is the lower of either the set change value or the maximum that can be 
    // added or subtracted without making the percentage outside of the floor:ceiling bounds
    var r_change = (Math.abs(change) < Math.abs(check - start_vals[move])) ? change : (check - start_vals[move]);
    var total = 0;
    var length = start_vals.length;
    var div = 2;

    // Check special case rules
    if (start_vals[0] == 1) {
      length = 1;
    }
    else if (start_vals[0] == 2) {
      length = 3;
      div = 1;
    }

    // Loop through the current map percentages and update the two that weren't chosen by the AI
    for (var count = 1; count < length; count++) {
      if (count == move) {
        continue;
      }

      // If the change puts the percentage outside of the bounds, set the percentage equal to the bound
      if ((start_vals[count] - r_change/div) > this.floor) {
        if ((start_vals[count] - r_change/div) < this.ceiling) {
          new_vals[count] = Math.floor((start_vals[count] - r_change/div)*100)/100;
        }
        else {
          new_vals[count] = this.ceiling;
        }
      }
      else {
        new_vals[count] = this.floor;
      }
      total += new_vals[count];
    }

    // Update the move that was chosen by the AI
    new_vals[move] = Math.floor((100 - total)*100)/100;

    return new_vals;
  }

  /**
   * This function uses a random number generator and an input weighted map to choose
   * a number, 1 through 3, which represents the number of sticks to be removed. It is
   * used by the AI and the model to determine how many sticks to pick up at a given
   * number of sticks left.
   *
   * @param {[int, int, int, int]} weighted_map   The weighted map for a given number of sticks
   * @return int num                              The number (1-3) chosen
   */
  chooseNum(weighted_map) {
    var randNum = Math.floor((Math.random() * 10000) + 1)/100;
    var num;

    if (randNum <= weighted_map[1]) {
      num = 1;
    }
    else if ((weighted_map[1] < randNum) && (randNum <= (weighted_map[1]+weighted_map[2]))) {
      num = 2;
    }
    else if (((weighted_map[1]+weighted_map[2]) < randNum) && (randNum <= 100)) {
      num = 3;
    }

    return num;
  }
}

module.exports = {
  AI
};
