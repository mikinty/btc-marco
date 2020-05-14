/** 
 * @file Functions for requesting data from the Coinbase API
 * @author mikinty
 */

import *  as CONST from './CONST.js';

const CoinbasePro = require('coinbase-pro');
const publicClient = new CoinbasePro.PublicClient();

/**
 * Retrieves price data from the Coinbase API
 */
export async function get_past_prices () {
  let curr_time = new Date();
  let end_iso = curr_time.toISOString();
  curr_time.setHours(curr_time.getHours() - CONST.CHART_TIME_HRS);

  return publicClient.getProductHistoricRates(CONST.TICKER, {
    'start': curr_time.toISOString(),
    'end': end_iso,
    'granularity': CONST.GRANULARITY, 
  });
}

/**
 * Starts periodic request to update the price
 * @param {*} elem Price ticker object
 */
export function request_again (elem) {
  let prev_price = -1;

  setInterval (
    () => {
      publicClient.getProductTicker(CONST.TICKER)
        .then(data => {
          // console.log(data);
          elem.innerHTML = `${CONST.TICKER}: $${data.price}`;

          if (prev_price != -1) {
            let delta = data.price - prev_price;

            elem.classList.remove('update_green');
            elem.classList.remove('update_red');
            if (delta < 0) {
              elem.classList.add('update_red');
            } else if (delta > 0) {
              elem.classList.add('update_green');
            }
                    
          }

          prev_price = data.price;
        })
        .catch(error => {
          console.log(error);
        });
    },
    CONST.REFRESH_RATE
  );
}