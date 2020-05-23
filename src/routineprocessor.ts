/* ROUTINE PROCESSOR
 * -----------------
 * The purpose of this file is to encapsulate all routines that can occur
 * through the GUI. HTML buttons generally reference these.
 */
// @ts-ignore
import * as notebook from "./window.notebook";
// @ts-ignore
import * as status_indicator from './window.statuses';
// @ts-ignore
import * as serial from "./serial";

export enum RoutineID {
	CONNECT,
	DISCONNECT,
	REACTION_STOP,

	REACTION_START = "Start Reaction",
	ARGON_PURGE = "Argon Purge",
	DIAGNOSTICS = "Run Diagnostics"
};

export function init()
{
	const cmd_sel = document.getElementById('command-selector') as HTMLSelectElement;
	
	// Populate the command selector element in such a way that it
	// will work with the execute_command() function later in this file.
	[RoutineID.REACTION_START,
	 RoutineID.ARGON_PURGE,
	 RoutineID.DIAGNOSTICS
	].forEach((rtn) => {
		cmd_sel.innerHTML += 
			"<option value='" + rtn + "'>" + rtn + "</option>";
	 });

}

export function routine_connect_toggle()
{
	if (serial.connected())
		routine_disconnect();
	else
		routine_connect();
}

function routine_connect()
{
	if (serial.open())
	{
		notebook.append("Reactor Connection Opened!");
	}
	else
	{
		notebook.append("Reactor Connection Failed", notebook.ERROR);
	}
}

function routine_disconnect()
{
	serial.close();
	// @ts-ignore
	status_indicator.update(status_indicator.DISCONNECTED);
	notebook.append("Reactor Connection Terminated");
}

export function reaction_stop()
{
	notebook.append("Stop Routine Not Implemented", notebook.ERROR);
}

export function execute_command()
{
	let cmd_sel = document.getElementById("command-selector") as HTMLSelectElement;
	// serial.write()
	
	switch(cmd_sel.options[cmd_sel.selectedIndex].value)
	{
		case RoutineID.REACTION_START:
			reaction_start();
			break;
		case RoutineID.ARGON_PURGE:
			argon_purge();
			break;
		case RoutineID.DIAGNOSTICS:
			diagnostics();
			break;
		default:
			return;
	}

	notebook.append("COMMAND SENT > " + 
			cmd_sel.options[cmd_sel.selectedIndex].innerHTML);
}

function reaction_start()
{

}

/* Author: Thomas Richmond
 * Purpose: Performs an Argon purge of the reactor
 */
function argon_purge()
{

}

function diagnostics()
{
	// THIS IS A SPOOF IMPLEMENTATION
	// TODO PUT ACTUAL CODE IN HERE
	setTimeout(() => {
		notebook.append("----------------------------------")
		notebook.append("REACTOR DIAGNOSTICS:")
		notebook.append("\tNOTE: Spoofed Diagnostics", notebook.WARNING);
		notebook.append("\tFlow Rates.....Normal");	
		notebook.append("\tTemperatures...Normal");
		notebook.append("\tScale..........Approaching Limit");
		notebook.append("----------------------------------")
	}, 1200);
}
