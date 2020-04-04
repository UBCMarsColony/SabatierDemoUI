import SerialPort from "serialport";
import { Dataset, Dataseries, Datapoint, name_from_id } from "./models/data.model";

export enum SerialBinding
{
	DATA,
	STATUS
};
// All bindings are stored here:
const bindings: any = {
	data: [],
	status: []
}

export enum SerialStatus
{
	UNDETERMINED,  // Placeholder for startup
	SCANNING,      // Looking for compatible serial devices
	ATTACHED,      // Serial connection available and ready
	CONNECTED,     // Connected to a compatible serial device
	DISCONNECTED   // Unexpected closure of serial connection
}

let port: SerialPort = null;

export function init()
{
	// Stub
}

export function bind(cb: Function, bind_id: SerialBinding)
{
	// When binding a function, we need to make sure it gets
	// put into the correct binding array. This switch case
	// ensures that happens.
	switch (bind_id) 
	{
		case SerialBinding.DATA:
			bindings.data.push(cb);
			break;
		case SerialBinding.STATUS: 
			bindings.status.push(cb); 
			break;
	}
}

export function run()
{
	if (connected())
		return;  // Everything is fine!
	
	// At this point, we know we are not connected to any ports.
	// Let's see if we can attach to one...
	// @ts-ignore  (Usual type PortInfo doesn't seem to work)
	SerialPort.list().then((ports: Array<any>) =>
	{
		if (ports.length === 0)
		{
			bindings.status.forEach((status_cb: Function) =>
				status_cb(SerialStatus.SCANNING));
		}
		else 
		{
			attach(ports[0].path, DEFAULT_PORT_CB);
			bindings.status.forEach((status_cb: Function) =>
				status_cb(SerialStatus.ATTACHED));
		}
	}).catch(alert);
}


type SerialReceiveCallback = (bytestream: Array<number>) => void;
const DEFAULT_PORT_CB: SerialReceiveCallback = (bytestream: Array<number>) =>
{
	if (!bytestream)  // The bytestream isn't defined, so exit immediately
		return;

	let parsed_dataset: Dataset;
	try
	{
		parsed_dataset = parse_reactor_data(bytestream)
	}
	catch (e)
	{
		console.log("Reactor Data Parse Failed with trace: ", e)
		return;
	}
	if (!parsed_dataset)  // Something went wrong in the parse routine
		return;       // that wasn't caught; exit now

	parsed_dataset.name = name_from_id(parsed_dataset.id)
	for (let series of parsed_dataset.series)
		series.name = name_from_id(parsed_dataset.id, series.id);

	bindings.data.forEach((data_cb: Function) => 
		data_cb(parsed_dataset));
};


function attach(path: string, on_receive: SerialReceiveCallback)
{
	// @ts-ignore
	port = new SerialPort(path, {
		baudRate: 2000000,  // 2 Mb/s
		autoOpen: false	    // Wait for the user to connect
	});
	
	const parser = port.pipe(
		new SerialPort.parsers.Ready({delimiter: 'RSIP>>'}));
	parser.on('ready', () => console.log('Data incoming'));
	parser.on('data', on_receive);
}

export function open(): boolean
{
	if (port == null)
		return false
	
	// TODO implement async handling for port opening successes and errors
	port.open();
	bindings.status.forEach((status_cb: Function) => 
		status_cb(SerialStatus.CONNECTED))
	
	return true;
}

export function close()
{
	if (port == null)
		return;
		
	port.close();
	port = null;
}

export function connected(): boolean
{
	return  port == null  ? false :
		!port.isOpen ?  false :
		true;
}

function parse_reactor_data(bytestream: Array<number>): Dataset
{
	bytestream = bytestream.slice(6);  // Take off the indicator "RSIP>>"
	
	// console.log("RAW-->");
	// console.log(data);
	// console.log("Class: " + data[0]);
	// console.log("Descriptor: " + data[1]);
	// console.log("Datapoint: " + data[2] + " X " + data[3]);
	
	if (bytestream[1] > 5)
		return;
	
	if (bytestream[3] === 0)
		return;
	
	let dataset: Dataset = {
		name: null,			// Don't need to define this here
		id: bytestream[1],
		units: null,		// Don't need to define this here
		series: []
	};
	for (let i = 0; i < bytestream[2]; i++)
	{
		let buffer = bytestream.slice(4 + i * bytestream[3], 4 + (i + 1) * bytestream[3]);
		// console.log(buffer);
		if (buffer.length === 0)
			return;
		const view = new DataView(new ArrayBuffer(bytestream[3]));
		for (let j = 0; j < bytestream[3]; j++)
			view.setInt8(j, buffer[j]);
			
		// console.log(view);
		const next_ser_id = view.getInt16(0, true);
		let series_index = dataset.series.findIndex((s: Dataseries) => s.id === next_ser_id);
		if (series_index === -1)
		{
			series_index = dataset.series.length;
			dataset.series[series_index] = {
				name: null,
				id: next_ser_id,
				data: []
			};
		}
		
		dataset.series[series_index].data.push({
			time: view.getInt32(2, true) / 1000.0,
			value: view.getFloat32(6, true)
		});
	}
	// console.log(datapoints);
	return dataset;
}
