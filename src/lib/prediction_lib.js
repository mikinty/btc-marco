/** 
 * @file Predicts future prices with technical analysis.
 * @author mikinty
 */

import { INDEX_STATE } from '../index.js';
import { line_best_fit } from './general_lib.js';
import * as CONST from '../CONST.js';
import { Curve } from '../obj/graph.js';

export function predict_price (prices, end_time, input, noise = 15) {
  let new_prices = [[], []];
  let num_points = prices.num_points;
  let past_ratio = 1/2;

  let last_third = new Curve(
    prices.x.slice(Math.round(num_points * past_ratio), num_points-1),
    prices.y.slice(Math.round(num_points * past_ratio), num_points-1)
  );

  let line_best = line_best_fit(last_third);
  
  let start_point = [prices.x[num_points - 1], prices.y[num_points - 1]];
  let curr_y = start_point[1];

  // Generate new points
  let curr_granularity = INDEX_STATE.curr_timescale.granularity;
  for (let t = start_point[0]; t <= end_time; t += curr_granularity) {
    new_prices[0].push(
      t
    );

    new_prices[1].push(
      curr_y
    );

    // Calculate new point
    curr_y += line_best.m * curr_granularity + noise*(Math.random() - 0.5);
  }

  return new Curve (
    new_prices[0],
    new_prices[1]
  );
}