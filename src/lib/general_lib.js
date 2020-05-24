/** 
 * @file General library functions.
 * @author mikinty, emc2d
 */

import { Line, Curve } from '../obj/graph.js';

export function derivative (data_xy) {
  let dv = new Curve();

  for (let i = 1; i < data_xy.num_points; i++) {
    dv.add_point(
      (data_xy.x[i] + data_xy.x[i-1])/2,
      (data_xy.y[i] - data_xy.y[i-1])/(data_xy.x[i] - data_xy.x[i-1])
    );
  }

  return dv;
}

export function local_optima (dv_xy) {
  let local_optima_pts = [[], []];
  
  for (let i = 1; i < dv_xy.num_points; i++) {
    if (dv_xy.y[i] > 0 && dv_xy.y[i-1] < 0) {
      local_optima_pts[0].push(
        (dv_xy.x[i] + dv_xy.x[i-1])/2
      );
    } else if (dv_xy.y[i] < 0 && dv_xy.y[i-1] > 0) {
      local_optima_pts[1].push(
        (dv_xy.x[i] + dv_xy.x[i-1])/2
      );
    }
  }

  return local_optima_pts;
}

/** @brief  Finds the line of best fit given some points. Points do not have to be in order.
 *  @param  curve Curve object
 *  
 *  @return Line object
 */
export function line_best_fit (points) {
  // variables
  var sum_x = 0;
  var sum_y = 0;
  var sum_x2 = 0; // X squared
  var sum_xy = 0;
  var num_points = points.num_points; //n, number of points

  for (let idx = 0; idx < num_points; idx++) {
    let x = points.x[idx];
    let y = points.y[idx];
    sum_x += x;
    sum_y += y;
    sum_x2 += x*x;
    sum_xy += x*y;     
  }

  // now calculate slope and intercept
  let m = (num_points*sum_xy - sum_x*sum_y) / (num_points*sum_x2 - sum_x*sum_x);
  let b = (sum_y/num_points) - (m*sum_x)/num_points;

  return new Line(m, b);
}

export function std (points) {
  let mean = (points.reduce((a, b) => a + b, 0))/points.length;
  let diff_s = [];

  for (let idx = 0; idx < points.length; idx++) {
    diff_s.push((points[idx] - mean)**2);

  }
  let sum_diff_s = (diff_s.reduce((a, b) => a + b, 0))/(diff_s.length - 1);

  return Math.sqrt(sum_diff_s);
}