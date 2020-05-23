import { Dataset } from "./data.model"

export type Bytestream = Array<number>;

export enum SerialStatus
{
	UNDETERMINED,  // Placeholder for startup
	SCANNING,      // Looking for compatible serial devices
	ATTACHED,      // Serial connection available and ready
	CONNECTED,     // Connected to a compatible serial device
	DISCONNECTED   // Unexpected closure of serial connection
};

// Enumerates the binding types below.
export enum SerialBinding
{
	DATA,
	STATUS
};

// Serial Event Binding Definitions
export type StatusBinding = (status: SerialStatus) => void;  // Called whenever the reactor connection status changes.
export type DataBinding   = (data:   Dataset) => void;  // Called whenever new reactor data is parsed
export type BindingStore = {  // Object to encapsulate bindings.
	status: Array<StatusBinding>
	data:   Array<DataBinding>
};

// Runs whenever new serial data is received from the reactor
export type SerialReceiveCallback = (bytestream: Bytestream) => void;

