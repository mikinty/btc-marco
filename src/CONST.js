/** @file  CONST.js
 * 
 *  @brief Constant definitions used throughout the site. 
 * 
 *  @author mikinty
 */

/** Ticker we are analyzing */
export const TICKER = 'BTC-USD';
/** The base url for all Coinbase API requests */
const COINBASE_URL = `https:\/\/api.pro.coinbase.com\/products\/`;
/** Constructs request URLs */
export const REQUEST_TICKER_URL = (ticker) => `${COINBASE_URL}${ticker}\/ticker`;
/** Requests past candle data (opening closing prices) */
export const REQUEST_CANDLE_URL = (ticker) => `${COINBASE_URL}${ticker}\/candles`;
/** How much price history to look at */
export const CHART_TIME_HRS = 6;
/** Granularity for the chart as defined by the Coinbase Pro API */
export const GRANULARITY = [60, 300, 900, 3600, 21600, 86400][1];
/** Price refresh rate (in ms) */
export const REFRESH_RATE = 200;

/*** CHART ***/
export const CHART_WIDTH  = 4096;
export const CHART_HEIGHT = 2160;
/** Chart padding for top and botom, percentage decimal. */
export const CHART_PADDING = 0.2;
export const CHART_WRAPPER_CLASS = 'stock_chart';
export const CHART_WRAPPER_CLASS_INDICATOR = 'indicator_chart';
export const LINE_WIDTH_THIN = 3;
export const LINE_WIDTH_MEDIUM = 5;
export const LINE_WIDTH_THICK = 7;

/*** COLORS ***/
export const BLUE_LIGHT = '#33ECFF';
export const ORANGE_BITCOIN = '#F6921A';
export const GREEN_SHREK = '#9CDE47';
export const PURPLE_BARNEY = '#D95A9D';
export const RED_CHINA = '#DE2910';
export const YELLOW_BARRY = '#FFF44C';
export const WHITE = '#FFFFFF';