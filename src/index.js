import './style.scss';
import { get_past_prices, request_again } from './request.js';
import { analysis } from './analysis.js';
import { Chart } from './chart.js';
import * as CONST from './CONST.js';

const name_text = document.createElement('span');
name_text.classList.add('text');
name_text.innerHTML = 'Price:';

function component() {
  const element = document.createElement('div');
  element.classList.add('main');

  element.appendChild(name_text);
  
  return element;
}

document.body.appendChild(component());

/**
 * Initialization for the app. Creates the charts, fetches initial data.
 */
async function init () {
  let chart_price = new Chart();
  document.body.appendChild(chart_price.canvas_wrapper);

  // Draws the charts
  let data_response = await get_past_prices();
  let price_data = data_response.map(elem => (elem[1] + elem[2])/2);
  let time_data = data_response.map(elem => elem[0]);

  chart_price.set_context(
    time_data,
    price_data
  );

  chart_price.context.x_high += 0.5*(chart_price.context.x_high - chart_price.context.x_low);

  chart_price.plot_curve([time_data, price_data], 'price', CONST.BLUE_LIGHT, 5);

  let chart_analysis = new Chart();
  document.body.appendChild(chart_analysis.canvas_wrapper);

  analysis(data_response, chart_price, chart_analysis);

  // Kicks off price fetching
  request_again(name_text);
}

init();