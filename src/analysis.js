/** 
 * @file Wrapper for analysis functions
 * @author mikinty
 */

import { exp_moving_average, support_resistance } from './lib/analysis_lib.js';
import { derivative, local_optima, line_best_fit } from './lib/general_lib.js';
import { predict_price } from './lib/prediction_lib.js';
import { Line, Curve } from './obj/graph.js';
import * as CONST from './CONST.js';

function draw_trendline (price, chart) {
  // Draw future trendline
  let line_trendline = line_best_fit(price);

  chart.plot_line(line_trendline, 'trendline-lobf', (line_trendline.m > 0) ? CONST.GREEN_SHREK : CONST.RED_CHINA, 5);
}

/**
 * Performs a suite of analysis functions
 * @param {*} data The data to analyze, formatted as
 * [ time, low, high, open, close, volume ]
 */
export function analysis (data, chart_price, chart_analysis) {
  const LOW_IDX = 1;
  const HIGH_IDX = 2;

  /* mid_price is formatted as
   * x: time
   * y: mid price = (high + low)/2
   */
  let mid_price_raw = data.map(elem => [elem[0], (elem[HIGH_IDX]+elem[LOW_IDX])/2]);
  mid_price_raw.sort((a, b) => a[0] - b[0]);
  let mid_price = new Curve (
    mid_price_raw.map(e => e[0]),
    mid_price_raw.map(e => e[1])
  );

  // Do technical analysis
  const MA_WINDOW = 5;
  let price_ma = new Curve (
    mid_price.x,
    exp_moving_average(mid_price.y, MA_WINDOW)
  );

  // More TA
  let price_dv = [];
  price_dv.push(derivative(mid_price));
  let price_opt = local_optima(price_dv[0]);
  let ma_dv = [];
  ma_dv.push(derivative(price_ma));
  let ma_opt = local_optima(ma_dv[0]);

  chart_analysis.set_context(
    ma_dv[0].x,
    ma_dv[0].y,
  );

  chart_analysis.context.x_low  = chart_price.context.x_low;
  chart_analysis.context.x_high = chart_price.context.x_high;

  chart_analysis.plot_line(new Line(0, 0), 'x_axis');
  chart_analysis.plot_curve(ma_dv[0], 'derivative', CONST.ORANGE_BITCOIN, 5);

  let [line_support, line_resistance] = support_resistance(mid_price, price_opt);
  
  chart_price.plot_line(line_support, 'support');
  chart_price.plot_line(line_resistance, 'resistance');

  /*** PLOT TA on price chart ***/
  draw_trendline(mid_price, chart_price);
  chart_price.plot_curve(price_ma, 'price_ma', CONST.ORANGE_BITCOIN, 3);

  /*** PREDICT PRICES ***/
  let new_prices = predict_price(mid_price, chart_price.context.x_high, null);

  chart_price.plot_curve(new_prices, 'prediction', CONST.PURPLE_BARNEY, 5);
}
