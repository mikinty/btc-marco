import *  as CONST from './CONST.js';

const CoinbasePro = require('coinbase-pro');
const publicClient = new CoinbasePro.PublicClient();

export function get_past_prices () {
    let curr_time = new Date()
    let end_iso = curr_time.toISOString();
    curr_time.setHours(curr_time.getHours() - CONST.CHART_TIME_HRS)

    publicClient.getProductHistoricRates(CONST.TICKER, {
        'start': curr_time.toISOString(),
        'end': end_iso,
        'granularity': CONST.GRANULARITY, 
    })
    .then(data => {
        // Data looks like
        // [ time, low, high, open, close, volume ]
        const LOW_IDX = 1
        const HIGH_IDX = 2

        let mid_price = [];
        
        for (let i = 0; i < data.length; i++) {
            mid_price.push(
                (data[i][LOW_IDX] + data[i][HIGH_IDX])/2
            );
        }

        // Do technical analysis
        const MA_WINDOW = 5;
        let moving_average = [];

        for (let i = 0; i < mid_price.length; i++) {
            let curr_sum = 0;

            for (let j = 0; j < MA_WINDOW; j++) {
                if (i - j < 0) {
                    break;
                }
                curr_sum += mid_price[i - j];
            }

            let divide = Math.min(MA_WINDOW, i+1);

            moving_average.push(
                curr_sum/divide
            );
        }

        /*** PLOT DATA ***/
        const CHART_WIDTH = 600;
        const PRICE_WIDTH = CHART_WIDTH*(2/3);
        const CHART_HEIGHT = 400;
        const canvas_wrapper = document.createElement('div');
        canvas_wrapper.classList.add('stock_chart');
        const canvas = document.createElement('canvas');

        // Define chart bounds
        canvas.width = CHART_WIDTH;
        canvas.height = CHART_HEIGHT;
        const PRICE_PAD = 250;
        const CHART_LOW = Math.min(...mid_price) - PRICE_PAD;
        const CHART_HIGH = Math.max(...mid_price) + PRICE_PAD;
        const CHART_RANGE = CHART_HIGH - CHART_LOW;

        // Draw price line
        let ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.strokeStyle = CONST.BLUE_LIGHT;
        for (let i = 0; i < mid_price.length; i++) {
            let curr_x = (i) * (PRICE_WIDTH/mid_price.length);
            let curr_y = CHART_HEIGHT*(mid_price[i] - CHART_LOW)/CHART_RANGE;
            
            if (i == 0) {
                ctx.moveTo(curr_x, curr_y);
            }

            ctx.lineTo(curr_x, curr_y);
        }

        ctx.stroke();

        // Draw MA line
        ctx.beginPath();
        ctx.strokeStyle = CONST.ORANGE_BITCOIN;
        for (let i = 0; i < moving_average.length; i++) {
            let curr_x = (i) * (PRICE_WIDTH/mid_price.length);
            let curr_y = CHART_HEIGHT*(moving_average[i] - CHART_LOW)/CHART_RANGE;
            
            if (i == 0) {
                ctx.moveTo(curr_x, curr_y);
            }

            ctx.lineTo(curr_x, curr_y);
        }

        ctx.stroke();

        /*** PREDICT DATA ***/
        let start_price = mid_price[0];
        let end_price = mid_price[mid_price.length - 1];
        let slope = (end_price - start_price)/PRICE_WIDTH;

        // Draw future trendline
        let curr_x = (mid_price.length-1) * (PRICE_WIDTH/mid_price.length);
        let curr_y = CHART_HEIGHT*(mid_price[mid_price.length-1] - CHART_LOW)/CHART_RANGE;
        ctx.beginPath();

        ctx.moveTo(curr_x, curr_y);

        if (slope < 0) {
            ctx.strokeStyle = CONST.GREEN_SHREK;
        } else {
            ctx.strokeStyle = CONST.RED_CHINA;
        }

        ctx.lineTo(CHART_WIDTH, curr_y + slope*(CHART_WIDTH - PRICE_WIDTH));
        ctx.stroke();

        // More TA
        const canvas_wrapper_2 = document.createElement('div');
        canvas_wrapper_2.classList.add('stock_chart');
        const canvas_2 = document.createElement('canvas');

        canvas_2.width = CHART_WIDTH;
        canvas_2.height = CHART_HEIGHT;

        let derivative = [[], []];

        for (let i = 1; i < mid_price.length; i++) {
            derivative[0].push(
                (mid_price[i] - mid_price[i-1]) 
            );
        }

        for (let i = 1; i < derivative[0].length; i++) {
            derivative[1].push(
                (derivative[0][i] - derivative[0][i-1])
            );
        }

        // Plot second canvas
        let ctx_2 = canvas_2.getContext('2d');
        
        let colors = [
            CONST.RED_CHINA,
            CONST.GREEN_SHREK
        ]
        
        for (let j = 0; j < derivative.length; j++) {
            ctx_2.beginPath();
            ctx_2.strokeStyle = colors[j];
            for (let i = 0; i < derivative[j].length; i++) {
                let curr_x = (i) * (PRICE_WIDTH/derivative[j].length);
                let curr_y = CHART_HEIGHT*(derivative[j][i])/(150) + 100;
                
                if (i == 0) {
                    ctx_2.moveTo(curr_x, curr_y);
                }

                ctx_2.lineTo(curr_x, curr_y);
            }
            ctx_2.stroke()
        }

        

        canvas_wrapper.appendChild(canvas);
        canvas_wrapper_2.appendChild(canvas_2);
        document.body.appendChild(canvas_wrapper);
        document.body.appendChild(canvas_wrapper_2);
    })
}

export function request_again (elem) {
    let prev_price = -1;

    setInterval(
        () => {
            publicClient.getProductTicker(CONST.TICKER)
            .then(data => {
                // console.log(data);
                elem.innerHTML = `${CONST.TICKER}: $${data.price}`

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
    )
}