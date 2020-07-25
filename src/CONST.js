/** @file  CONST.js
 * 
 *  @brief Constant definitions used throughout the site. 
 * 
 *  @author mikinty
 */

/** Ticker we are analyzing */
export const DEFAULT_TICKER = 'BTC-USD';
export const TICKER_LIST = [
  'BTC-USD',
  'ETH-USD',
  'LTC-USD',
  'XTZ-USD',
  'LINK-USD'
];

/** The base url for all Coinbase API requests */
const COINBASE_URL = `https:\/\/api.pro.coinbase.com\/products\/`;
/** Constructs request URLs */
export const REQUEST_TICKER_URL = (ticker) => `${COINBASE_URL}${ticker}\/ticker`;
/** Requests past candle data (opening closing prices) */
export const REQUEST_CANDLE_URL = (ticker) => `${COINBASE_URL}${ticker}\/candles`;
/** Granularity for the chart as defined by the Coinbase Pro API */
export const GRANULARITY_LIST = [60, 300, 900, 3600, 21600, 86400];
/** List of available timescales */
export const TIMESCALE_LIST = [
  {
    name: '1m',
    // 90 minutes prior
    start_time: (curr_time) => {
      curr_time.setMinutes(curr_time.getMinutes() - 90);
      return curr_time.toISOString();
    },
    granularity: GRANULARITY_LIST[0]
  },
  {
    name: '5m',
    // 8:20 prior
    start_time: (curr_time) => {
      curr_time.setMinutes(curr_time.getMinutes() - 500);
      return curr_time.toISOString();
    },
    granularity: GRANULARITY_LIST[1]
  },
  {
    name: '15m',
    // 24 hrs prior
    start_time: (curr_time) => {
      curr_time.setHours(curr_time.getHours() - 24);
      return curr_time.toISOString();
    },
    granularity: GRANULARITY_LIST[2]
  },
  {
    name: '1h',
    // 4 days prior
    start_time: (curr_time) => {
      curr_time.setHours(curr_time.getHours() - 4*24);
      return curr_time.toISOString();
    },
    granularity: GRANULARITY_LIST[3]
  },
  {
    name: '6h',
    // 25 days prior
    start_time: (curr_time) => {
      curr_time.setHours(curr_time.getHours() - 24*25);
      return curr_time.toISOString();
    },
    granularity: GRANULARITY_LIST[4]
  },
  {
    name: '1d',
    // 100 days prior
    start_time: (curr_time) => {
      curr_time.setHours(curr_time.getHours() - 24*100);
      return curr_time.toISOString();
    },
    granularity: GRANULARITY_LIST[5]
  }
];
/** The default timescale we start with */
export const DEFAULT_TIMESCALE = TIMESCALE_LIST[3];
/** How much price history to look at */
export const CHART_TIME_HRS = 6;
/** Price refresh rate (in ms) */
export const REFRESH_RATE = 500;

/*** CHART ***/
export const CHART_WIDTH  = 4096;
export const CHART_HEIGHT = 2160;
export const CHART_LAYER_AXES = 'axes';
export const CHART_LAYER_DEFAULT = 'main';
export const CHART_LAYER_OVERLAY = 'overlay';
export const CHART_STYLE_LINE = 'line';
export const CHART_STYLE_BAR  = 'bar';
export const CHART_STYLE_HIGHLIGHT  = 'highlight';
export const CHART_CONTEXT_DEFAULT = 'default';
/** Chart padding for top and bottom, percentage decimal. */
export const CHART_PADDING = 0.2;
export const CHART_WRAPPER_CLASS = 'stock_chart';
export const CHART_WRAPPER_CLASS_INDICATOR = 'indicator_chart';
export const LINE_WIDTH_THIN = 5;
export const LINE_WIDTH_MEDIUM = 7;
export const LINE_WIDTH_THICK = 10;
export const LINE_WIDTH_XXXTRA_THIQQ = 15;

/*** COLORS ***/
export const BLUE_LIGHT = '#33ECFF';
export const ORANGE_BITCOIN = '#F6921A';
export const GREEN_SHREK = '#9CDE47';
export const PURPLE_BARNEY = '#D95A9D';
export const RED_CHINA = '#DE2910';
export const YELLOW_LIGHT = '#FCE803';
export const YELLOW_BARRY = '#FFF44C';
export const WHITE = '#FFFFFF';