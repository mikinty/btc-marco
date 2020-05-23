/** 
 * @file Library functions for performing technical analysis.
 * @author mikinty
 */

import { line_best_fit, std } from './general_lib.js';
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

export function macd (prices, period_1, period_2) {
  let ema_1 = exp_moving_average(prices, period_1);
  let ema_2 = exp_moving_average(prices, period_2);
  let macd  = [];

  for (let idx = 0; idx < ema_1.length; idx++) {
    macd.push(
      ema_1[idx] - ema_2[idx]
    );
  }  

  return [macd, ema_1, ema_2];
}

/**
 * Finds the upper and lower bollinger bands of a price curve, given a simple moving average.
 * 
 * @param {float[]} MA The simple moving average
 * @param {int} n The number of days in the smoothing period, usually 20
 * @param {int} m The number of standard deviations, usually 2
 * @param {float[]} sigma standard deviation over last n periods of TP
 * 
 * @returns [
 * @param {float[]} UBOL The upper Bollinger Band
 * @param {float[]} LBOL The lower Bollinger Band
 * ]
 */
export function BG_bands (n, m) {

  // Calculate the typical price, TP
  let TP = [];
   
  for (let idx = 0; idx < MA.num_points; idx++) {
    TP.push((High + Low + Close)/3); // Typical price [(High + Low + Close)/3]
  }

  // Find the standard deviation over the last n periods of TP

  let sigma = std(TP);
  let MA = moving_average(TP, n);

  // Now calculate the upper and lower Bollinger Bands
  let UBOL = new Curve();
  let LBOL = new Curve();

  for (let idx = 0; idx < MA.num_points; idx++) {
    UBOL.y.push(MA[idx] + m*sigma);
    LBOL.y.push(MA[idx] - m*sigma);
  }
  return [UBOL, LBOL];
}