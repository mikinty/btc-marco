import './style.scss';
import { get_past_prices, request_again } from './request.js';
import { analysis } from './analysis.js';
import { Chart } from './obj/chart.js';
import { Curve } from './obj/graph.js';
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

/**
 * Initialization for the app. Creates the charts, fetches initial data.
 */
async function init () {
  let chart_price = new Chart(CONST.CHART_WIDTH, CONST.CHART_HEIGHT, CONST.CHART_WRAPPER_CLASS, true);
  document.body.appendChild(chart_price.canvas_wrapper);

  let chart_analysis = new Chart(CONST.CHART_WIDTH, CONST.CHART_HEIGHT/2, CONST.CHART_WRAPPER_CLASS_INDICATOR);
  document.body.appendChild(chart_analysis.canvas_wrapper);

  let chart_indicator = new Chart(CONST.CHART_WIDTH, CONST.CHART_HEIGHT/2, CONST.CHART_WRAPPER_CLASS_INDICATOR);
  document.body.appendChild(chart_indicator.canvas_wrapper);

  // Draws the charts
  let data_response = await get_past_prices();
  let price_data = data_response.map(elem => (elem[1] + elem[2])/2);
  let time_data = data_response.map(elem => elem[0]);

  console.log(data_response);

  chart_price.plot_curve(
    new Curve(time_data, price_data), 
    'price', 
    CONST.BLUE_LIGHT, 
    CONST.LINE_WIDTH_XXXTRA_THIQQ,
    0.1
  );

  analysis(data_response, chart_price, chart_analysis, chart_indicator);

  // Kicks off price fetching
  request_again(name_text);
}

document.body.appendChild(component());
init();