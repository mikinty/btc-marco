export const TICKER = 'BTC-USD';
/** @brief How much price history to look at */
export const CHART_TIME_HRS = 6;
/** @brief Granularity for the chart as defined by the Coinbase Pro API */
export const GRANULARITY = [60, 300, 900, 3600, 21600, 86400][1];
/** @brief Price refresh rate (in ms) */
export const REFRESH_RATE = 200;