/** 
 * @file Class definitions for objects used to represent data on charts.
 * @author mikinty
 */

class Line {
  /**
   * Constructs a line in y-intercept form
   * @param {float} m Slope
   * @param {float} b y-intercept
   */
  constructor (m, b) {
    this.m = m;
    this.b = b;
  }

  compute_y (x) {
    return x*this.m + this.b;
  }

  compute_x (y) {
    return (y-this.b)/this.m;
  }
}

class Curve {
  /**
   * Represents a curve as a set of x and y values, corresponding 1:1
   * @param {float[]} x_list List of x values
   * @param {float[]} y_list List of y values
   */
  constructor (x_list = [], y_list = []) {
    if (x_list.length != y_list.length) {
      throw new Error('[Curve constructor] x_list and y_list are different lengths');
    }

    this.x = x_list;
    this.y = y_list;
    this.num_points = this.x.length;
  }

  add_point (x, y) {
    this.x.push(x);
    this.y.push(y);

    this.num_points++;
  }
}

export { Line, Curve };