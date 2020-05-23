import { SerialStatus } from "./models/serial.model"

// Lookup table for status strings
type StatusGData = {  // Graphical Data lookup for display purposes
	str: string,
	color: string,
	interactive: boolean}
const status_gdata_lookup: Array<StatusGData> = [];
status_gdata_lookup[SerialStatus.UNDETERMINED] =
	{str: "Undetermined", color: "black", interactive: false};
status_gdata_lookup[SerialStatus.SCANNING]     = 
	{str: "Scanning    ", color: "blue",  interactive: false};
status_gdata_lookup[SerialStatus.ATTACHED]     = 
	{str: "Attached    ", color: "blue",  interactive: true};
status_gdata_lookup[SerialStatus.CONNECTED]    = 
	{str: "Connected   ", color: "green", interactive: true};
status_gdata_lookup[SerialStatus.DISCONNECTED] = 
	{str: "Disconnected", color: "red",   interactive: false};
console.log(status_gdata_lookup);
export function update(serial_status: SerialStatus)
{
	let status = status_gdata_lookup[serial_status]
	document.getElementById('reactor-status').style.color = status.color;
	document.getElementById('reactor-status').innerHTML = status.str;
	const inter_button = document.  // The connection button 
		getElementById('connect-toggle-button') as HTMLButtonElement;
	
	inter_button.disabled = !status.interactive;
}

