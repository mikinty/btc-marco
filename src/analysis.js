/** 
 * @file Wrapper for analysis functions
 * @author mikinty
 */

import { slope, moving_average, exp_moving_average, derivative, local_optima } from './lib/analysis_lib.js';
import { line_best_fit, calculate_line } from './lib/lib.js';
import { predict_price } from './lib/prediction_lib.js';
import * as CONST from './CONST.js';

function draw_trendline (price, chart) {
  // Draw future trendline
  let mb = line_best_fit(price);

  let price_slope = slope(price, 0, price[0].length-1);

  let trend_y = price[1][0] + price_slope*(chart.context.x_high - price[0][0]);

  let points = [
    [price[0][0], chart.context.x_high],
    [price[1][0], trend_y]
  ];

  let lobf = [
    [price[0][0], chart.context.x_high],
    [calculate_line(mb[0], mb[1], price[0][0]), calculate_line(mb[0], mb[1], chart.context.x_high)]
  ];

  chart.plot_curve(points, 'trendline', (price_slope > 0) ? CONST.GREEN_SHREK : CONST.RED_CHINA, 5);
  chart.plot_curve(lobf, 'trendline-lobf', (mb[0] > 0) ? CONST.GREEN_SHREK : CONST.RED_CHINA, 5);
}

/**
 * Performs a suite of analysis functions
 * @param {*} data The data to analyze
 */
export function analysis (data, chart_price, chart_analysis) {
  // Data looks like
  // [ time, low, high, open, close, volume ]
  const LOW_IDX = 1;
  const HIGH_IDX = 2;

  /* mid_price is formatted as
   * x: time
   * y: mid price = (high + low)/2
   */
  let mid_price = data.map(elem => [elem[0], (elem[HIGH_IDX]+elem[LOW_IDX])/2]);
  mid_price.sort((a, b) => a[0] - b[0]);
  mid_price = [
    mid_price.map(e => e[0]),
    mid_price.map(e => e[1])
  ];

  // Do technical analysis
  const MA_WINDOW = 5;
  let price_ma = [mid_price[0], exp_moving_average(mid_price[1], MA_WINDOW)];

  // More TA
  let price_dv = [];
  price_dv.push(derivative(mid_price));
  let price_opt = local_optima(price_dv[0]);
  let ma_dv = [];
  ma_dv.push(derivative(price_ma));
  let ma_opt = local_optima(ma_dv[0]);

  chart_analysis.set_context(
    ma_dv[0][0],
    ma_dv[0][1],
  );

  chart_analysis.context.x_low  = chart_price.context.x_low;
  chart_analysis.context.x_high = chart_price.context.x_high;

  chart_analysis.plot_curve([[chart_analysis.context.x_low, chart_analysis.context.x_high], [0, 0]], 'axis_zero', CONST.WHITE, 2);
  chart_analysis.plot_curve(ma_dv[0], 'derivative', CONST.ORANGE_BITCOIN, 5);

  for (let idx = 0; idx < price_opt[0].length; idx++) {
    let curr_x = price_opt[0][idx];

    // chart_price.plot_curve([[curr_x, curr_x], [chart_price.context.y_low, chart_price.context.y_high]], 'local_min', CONST.RED_CHINA, 2);
  }

  for (let idx = 0; idx < price_opt[1].length; idx++) {
    let curr_x = price_opt[1][idx];

    // chart_price.plot_curve([[curr_x, curr_x], [chart_price.context.y_low, chart_price.context.y_high]], 'local_min', CONST.GREEN_SHREK, 2);
  }

  let num_support = 3;
  let la_opt = [];

  // Find support
  for (let idx = 0; idx < mid_price[0].length; idx++) {
    let curr_x = mid_price[0][idx];

    if (price_opt[0].includes(curr_x)) {
      // chart_price.plot_curve([[curr_x, curr_x], [chart_price.context.y_low, chart_price.context.y_high]], 'local_min', CONST.RED_CHINA, 5);
      la_opt.push([curr_x, mid_price[1][idx]]);
    }
  }

  la_opt.sort((a, b) => a[1] - b[1]);

  let support_line = [[], []];

  for (let idx = 0; idx < num_support; idx ++) {
    support_line[0].push(la_opt[idx][0]);
    support_line[1].push(la_opt[idx][1]);
  }

  let mb = line_best_fit(support_line);

  let m = mb[0];
  let b = mb[1];

  chart_price.plot_line(m, b, 'support');

  la_opt = [];
  // Find support
  for (let idx = 0; idx < mid_price[0].length; idx++) {
    let curr_x = mid_price[0][idx];

    if (price_opt[1].includes(curr_x)) {
      // chart_price.plot_curve([[curr_x, curr_x], [chart_price.context.y_low, chart_price.context.y_high]], 'local_min', CONST.GREEN_SHREK, 5);
      la_opt.push([curr_x, mid_price[1][idx]]);
    }
  }

  la_opt.sort((a, b) => b[1] - a[1]);

  let resistance_line = [[], []];

  for (let idx = 0; idx < num_support; idx ++) {
    resistance_line[0].push(la_opt[idx][0]);
    resistance_line[1].push(la_opt[idx][1]);
  }

  mb = line_best_fit(resistance_line);

  m = mb[0];
  b = mb[1];

  chart_price.plot_line(m, b, 'resistance');

  /*** PLOT TA on price chart ***/
  draw_trendline(mid_price, chart_price);
  chart_price.plot_curve(price_ma, 'price_ma', CONST.ORANGE_BITCOIN, 3);
  console.log(chart_price.curves);

  /*** PREDICT PRICES ***/
  let new_prices = predict_price(mid_price, chart_price.context.x_high, null);

  chart_price.plot_curve(new_prices, 'prediction', CONST.PURPLE_BARNEY, 5);

  // Backtesting
  let new_prices_backtest = predict_price([
    mid_price[0].slice(0, Math.round(mid_price[0].length*(2/3))),
    mid_price[1].slice(0, Math.round(mid_price[1].length*(2/3)))
  ], chart_price.context.x_high, null);

  chart_price.plot_curve(new_prices_backtest, 'prediction', CONST.YELLOW_BARRY, 5);
}
