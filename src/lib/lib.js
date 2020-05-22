/** @brief  Finds the line of best fit given some points. Points do not have to be in order.
 *  @param  points, x y values in the form
 *  [
 *    [x0, x1, x2, ...],
 *    [y0, y1, y2, ...]
 *  ]
 *  
 *  @return line, in the form
 *  {
 *    slope: float,
 *    intercept: float
 *  }
 */
export function line_best_fit (points) {
  // variables
  var sum_x = 0;
  var sum_y = 0;
  var sum_x2 = 0; // X squared
  var sum_xy = 0;
  var counter = points[0].length; //n, number of points

  for (let idx = 0; idx < points[0].length; idx++) {
    let x = points[0][idx];
    let y = points[1][idx];
    sum_x += x;
    sum_y += y;
    sum_x2 += x*x;
    sum_xy += x*y;
        
  }

  // now calculate slope and intercept
  let m = (counter*sum_xy - sum_x*sum_y) / (counter*sum_x2 - sum_x*sum_x);
  let b = (sum_y/counter) - (m*sum_x)/counter;

  return [m, b];

}

export function calculate_line (m, b, x) {
  return m*x + b;
}