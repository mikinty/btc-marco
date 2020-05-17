/** 
 * @file Library functions for performing technical analysis.
 * @author mikinty
 */

import { line_best_fit } from './general_lib.js';
import { Curve } from '../obj/graph.js';

/**
 * Calculate the linear moving average, given a window size
 * 
 * @param {float[]} data Data to find MA of 
 * @param {int} window_size Window size for MA
 */
export function moving_average (data, window_size) {
  let ma = [];

  for (let i = 0; i < data.length; i++) {
    let curr_sum = 0;

    for (let j = 0; j < window_size; j++) {
      if (i - j < 0) {
        break;
      }
      
      curr_sum += data[i - j];
    }

    let divide = Math.min(window_size, i+1);

    ma.push(
      curr_sum/divide
    );
  }

  return ma;
}

/**
 * Calculate the exponential moving average, given a window size
 * 
 * @param {float[]} data Data to find EMA of 
 * @param {int} window_size Window size for EMA
 */
export function exp_moving_average (data, window_size) {
  let ma = [];
  let k = 2/(window_size + 1);

  let curr_sum = data[0];
  for (let i = 0; i < data.length; i++) {
    curr_sum = k*data[i] + (1-k)*curr_sum;

    ma.push(
      curr_sum
    );
  }

  return ma;
}

/**
 * Finds the support and resistance lines of a price curve.
 * 
 * @param {float[]} mid_price The price curve
 * @param {float[]} price_opt Critical points in the price curve,
 * which indicates local optima
 * @param {int} num_peaks The number of critical points to use in the
 * S/R lines
 * 
 * @returns [
 *   support line,
 *   resistance line
 * ]
 */
export function support_resistance (mid_price, price_opt, num_peaks = 3) {
  let spikes = [[], []];

  for (let idx = 0; idx < mid_price.num_points; idx++) {
    let curr_x = mid_price.x[idx];

    if (price_opt[0].includes(curr_x)) {
      spikes[0].push([curr_x, mid_price.y[idx]]);
    }

    if (price_opt[1].includes(curr_x)) {
      spikes[1].push([curr_x, mid_price.y[idx]]);
    }
  }

  spikes[0].sort((a, b) => a[1] - b[1]);
  spikes[1].sort((a, b) => b[1] - a[1]);

  // Find support, we just take the 3 lowest points
  let support_line = new Curve();

  for (let idx = 0; idx < Math.min(num_peaks, spikes[0].length); idx ++) {
    support_line.add_point(
      spikes[0][idx][0],
      spikes[0][idx][1]
    );
  }

  // Find resistance, we just take the 3 highest points
  let resistance_line = new Curve();

  for (let idx = 0; idx < Math.min(num_peaks, spikes[1].length); idx ++) {
    resistance_line.add_point(
      spikes[1][idx][0],
      spikes[1][idx][1]
    );
  }

  return [
    line_best_fit(support_line),
    line_best_fit(resistance_line)
  ];
}