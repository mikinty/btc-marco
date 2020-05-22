/** 
 * @file Predicts future prices with technical analysis.
 * @author mikinty
 */

import { line_best_fit } from './lib.js';
import * as CONST from '../CONST.js';

export function predict_price (prices, end_time, input, noise = 15) {
  let new_prices = [[], []];
  let num_points = prices[0].length;
  let past_ratio = 1/2;

  let last_third = [
    prices[0].slice(Math.round(num_points * past_ratio), num_points-1),
    prices[1].slice(Math.round(num_points * past_ratio), num_points-1)
  ];

  let line_best = line_best_fit(last_third);
  
  let start_point = [prices[0][num_points - 1], prices[1][num_points - 1]];
  let curr_y = start_point[1];

  // Generate new points
  for (let t = start_point[0]; t <= end_time; t += CONST.GRANULARITY) {
    new_prices[0].push(
      t
    );

    new_prices[1].push(
      curr_y
    );

    // Calculate new point
    curr_y += line_best[0] * CONST.GRANULARITY + noise*(Math.random() - 0.5);
  }

  return new_prices; 
}