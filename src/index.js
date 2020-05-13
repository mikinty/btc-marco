import './style.scss';
import { request, get_past_prices, request_again } from './request.js';

const name_text = document.createElement('span');
name_text.classList.add('text');
name_text.innerHTML = 'Price:'

function component() {
  const element = document.createElement('div');
  element.classList.add('main');

  element.appendChild(name_text);
  
  return element;
}

document.body.appendChild(component());

get_past_prices();
request_again(name_text);