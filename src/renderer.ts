// The reactor's data
import { Dataset, Dataseries, Datapoint } from "./models/data.model";

// @ts-ignore
import reactor_data from './dist/reactor.data';

// Serial Connection

// @ts-ignore
import * as serial from './dist/serial';
// @ts-ignore
import { SerialStatus, SerialBinding } from "./dist/models/serial.model"
import SerialPort from 'serialport';  // Type

// UI Elements
// @ts-ignore
import * as status_indicator from './dist/window.statuses';
// @ts-ignore
import * as notebook from "./dist/window.notebook";
// console.log(notebook)
// @ts-ignore
import * as charts from "./dist/window.charts";
// @ts-ignore
import * as rtns from "./dist/routineprocessor";

// IIFE To initialize the window
function init() {
	// Status Indicators
	status_indicator.update(SerialStatus.UNDETERMINED);
	
	// Charts
	charts.init_charts();
	charts.init_selector(reactor_data.datasets);
	charts.primary.select(reactor_data.datasets[0]);
	notebook.append("UBC MARS COLONY\nReactor UI Initialized Successfully\n");

	// Serial
	serial.init()
	serial.bind(status_indicator.update, SerialBinding.STATUS)
	serial.bind(reactor_data.update,     SerialBinding.DATA)
	serial.bind(charts.primary.update,   SerialBinding.DATA)

	rtns.init();
}

function loop () {
	serial.run();
	
	let b0 = document.getElementById("connect-toggle-button") as HTMLButtonElement;
	b0.innerHTML = serial.connected() ? "Disconnect" : "Connect";
	let b1 = document.getElementById("reactor-stop-button") as HTMLButtonElement;
	b1.disabled = !serial.connected();
	let b2 = document.getElementById("execute-command-button") as HTMLButtonElement;
	b2.disabled = !serial.connected();
}


// INIT & LOOP FUNCTION IMPLEMENTATION
// IIFE that calls the init function once as soon as this file loads
$(init);  
// Calls the loop function routinely after the window completely loads
$(document).ready(() => setInterval(loop, 500));

