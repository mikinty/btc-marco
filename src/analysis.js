/** 
 * @file Wrapper for analysis functions
 * @author mikinty
 */

import { slope, moving_average, exp_moving_average, derivative, local_optima } from './lib/analysis_lib.js';
import * as CONST from './CONST.js';

function draw_trendline (price, chart) {
  // Draw future trendline
  let price_slope = slope(price, 0, price[0].length-1);

  let trend_y = price[1][0] + price_slope*(chart.context.x_high - price[0][0]);

  let points = [
    [price[0][0], chart.context.x_high],
    [price[1][0], trend_y]
  ];

  chart.plot_curve(points, 'trendline', (price_slope > 0) ? CONST.GREEN_SHREK : CONST.RED_CHINA, 5);
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

  for (let idx = 0; idx < ma_opt[0].length; idx++) {
    let curr_x = ma_opt[0][idx];

    chart_price.plot_curve([[curr_x, curr_x], [chart_price.context.y_low, chart_price.context.y_high]], 'local_min', CONST.RED_CHINA, 2);
  }

  for (let idx = 0; idx < ma_opt[1].length; idx++) {
    let curr_x = ma_opt[1][idx];

    chart_price.plot_curve([[curr_x, curr_x], [chart_price.context.y_low, chart_price.context.y_high]], 'local_min', CONST.GREEN_SHREK, 2);
  }

  /*** PLOT TA on price chart ***/
  draw_trendline(mid_price, chart_price);
  chart_price.plot_curve(price_ma, 'price_ma', CONST.ORANGE_BITCOIN, 3);
}
