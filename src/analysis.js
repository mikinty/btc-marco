/** 
 * @file Wrapper for analysis functions
 * @author mikinty
 */

import { exp_moving_average, support_resistance, macd, rsi } from './lib/analysis_lib.js';
import { derivative, local_optima, line_best_fit } from './lib/general_lib.js';
import { predict_price } from './lib/prediction_lib.js';
import { Line, Curve } from './obj/graph.js';
import * as CONST from './CONST.js';

function draw_trendline (price, chart) {
  // Draw future trendline
  let line_trendline = line_best_fit(price);

  chart.plot_line (
    line_trendline, 
    'trendline-lobf', 
    (line_trendline.m > 0) ? CONST.GREEN_SHREK : CONST.RED_CHINA, 
    CONST.LINE_WIDTH_MEDIUM,
    CONST.CHART_CONTEXT_DEFAULT,
    CONST.CHART_LAYER_OVERLAY
  );
}

/**
 * Performs a suite of analysis functions
 * @param {*} data The data to analyze, formatted as
 * [ time, low, high, open, close, volume ]
 */
export function analysis (
  data, 
  chart_price, 
  chart_indicator_top, 
  chart_indicator_bot
) {
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
  const MA_WINDOW = 15;
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

  // MACD
  const MACD_PERIOD_1 = 12;
  const MACD_PERIOD_2 = 26;
  let [
    macd_diff_y,
    price_ma_1_y,
    price_ma_2_y
  ] = macd(mid_price.y, MACD_PERIOD_1, MACD_PERIOD_2);

  let price_ma_1 = new Curve(mid_price.x, price_ma_1_y);
  let price_ma_2 = new Curve(mid_price.x, price_ma_2_y);
  let macd_diff = new Curve(mid_price.x, macd_diff_y);
  
  chart_indicator_top.plot_curve(price_ma_1, `ema_${MACD_PERIOD_1}`, CONST.BLUE_LIGHT, CONST.LINE_WIDTH_MEDIUM);
  chart_indicator_top.plot_curve(price_ma_2, `ema_${MACD_PERIOD_2}`, CONST.ORANGE_BITCOIN, CONST.LINE_WIDTH_MEDIUM);

  chart_indicator_top.set_context({}, 'macd_bar');

  // Separate positive and negative macd diffs
  let macd_diff_pn = [new Curve(), new Curve()];
  for (let idx = 0; idx < macd_diff.num_points; idx++) {
    if (macd_diff.y[idx] >= 0) {
      macd_diff_pn[0].add_point(
        macd_diff.x[idx],
        macd_diff.y[idx]
      );
    } else {
      macd_diff_pn[1].add_point(
        macd_diff.x[idx],
        macd_diff.y[idx]
      );
    }
  }

  chart_indicator_top.plot_curve (
    macd_diff_pn[0], 
    'macd_diff_p', 
    CONST.GREEN_SHREK, 
    3, 
    0.5, 
    'macd_bar', 
    CONST.CHART_LAYER_DEFAULT,
    CONST.CHART_STYLE_BAR
  );
  
  chart_indicator_top.plot_curve (
    macd_diff_pn[1], 
    'macd_diff_n', 
    CONST.RED_CHINA, 
    3, 
    0.5, 
    'macd_bar', 
    CONST.CHART_LAYER_DEFAULT,
    CONST.CHART_STYLE_BAR
  );

  chart_indicator_top.plot_line(
    new Line(0, 0), 
    'x_axis', 
    CONST.WHITE, 
    CONST.LINE_WIDTH_THIN, 
    'macd_bar', 
    CONST.CHART_LAYER_AXES, 
    CONST.CHART_LAYER_AXES
  );

  let rsi_data = rsi(data, 13);

  console.log(rsi_data);

  // RSI
  chart_indicator_bot.add_layer(CONST.CHART_LAYER_OVERLAY);
  chart_indicator_bot.plot_curve (
    rsi_data, 
    'RSI', 
    CONST.PURPLE_BARNEY, 
    CONST.LINE_WIDTH_MEDIUM
  );

  chart_indicator_bot.plot_line (
    new Line(0, 20), 
    'rsi_low', 
    CONST.WHITE, 
    CONST.LINE_WIDTH_THIN, 
    CONST.CHART_CONTEXT_DEFAULT,
    CONST.CHART_LAYER_OVERLAY
  );

  chart_indicator_bot.plot_line (
    new Line(0, 80), 
    'rsi_high', 
    CONST.WHITE, 
    CONST.LINE_WIDTH_THIN, 
    CONST.CHART_CONTEXT_DEFAULT, 
    CONST.CHART_LAYER_OVERLAY
  );

  let [line_support, line_resistance] = support_resistance(mid_price, price_opt);
  
  chart_price.plot_line (
    line_support, 
    'support', 
    CONST.WHITE, 
    CONST.LINE_WIDTH_MEDIUM, 
    CONST.CHART_CONTEXT_DEFAULT, 
    CONST.CHART_LAYER_OVERLAY
  );

  chart_price.plot_line ( 
    line_resistance, 
    'resistance',
    CONST.WHITE, 
    CONST.LINE_WIDTH_MEDIUM, 
    CONST.CHART_CONTEXT_DEFAULT, 
    CONST.CHART_LAYER_OVERLAY
  );

  /*** PLOT TA on price chart ***/
  draw_trendline(mid_price, chart_price);
  chart_price.plot_curve (
    price_ma, 
    'price_ma', 
    CONST.ORANGE_BITCOIN, 
    CONST.LINE_WIDTH_THICK,
    0,
    CONST.CHART_CONTEXT_DEFAULT,
    CONST.CHART_LAYER_OVERLAY
  );

  /*** PREDICT PRICES ***/
  let future_date = mid_price.x[mid_price.num_points - 1] + 5000;
  chart_price.set_context({
    x_high: future_date
  });
  chart_indicator_top.set_context({
    x_high: future_date
  });
  chart_indicator_top.set_context({
    x_high: future_date
  }, 'macd_bar');
  chart_indicator_bot.set_context({
    x_high: future_date,
    y_low: 0,
    y_high: 100
  });

  let new_prices = predict_price(mid_price, future_date, null);
  chart_price.plot_curve(
    new_prices, 
    'prediction', 
    CONST.PURPLE_BARNEY, 
    5,
    0,
    CONST.CHART_CONTEXT_DEFAULT,
    CONST.CHART_LAYER_OVERLAY
  );
}
