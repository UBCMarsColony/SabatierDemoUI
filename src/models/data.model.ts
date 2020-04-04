import { readFileSync } from "fs";
const path = require("path")
const RAW = readFileSync(
	path.join(__dirname, "../../res/reactor.data.json"), "utf8");

// The config-specified data format, which describes the
// datasets and dataseries that have been set up for use.
export const DATA_SPEC = JSON.parse(RAW) as Array<Dataset>;

// Three-layer data model
export type Datapoint = {
	time: number,	// In seconds
	value: number	// In whatever units are specified by the Dataset
};

export type Dataseries = {
	name: string,	// Ex. Mixer
	id: number,		// Ex. 1
	data: Array<Datapoint>
};

export type Dataset = {
	name: string,	// Ex. Temperature
	id: number,	// Ex. 1
	units: string,	// Ex. Celsius
	series: Array<Dataseries>
}

/*
 * Type guard to distinguish between dataclass and dataset
 */
export function is_dataset(data: Dataset | Dataseries): data is Dataset
{
	return (data as Dataset).units !== undefined;
}

/*
 * Purpose: Returns the name of a dataset or dataseries based on
 * 	    provided IDs. 
 *
 * Returns: If only the dataset_id is given, then the name of the 
 *	    corresponding dataset is returned.
 *	    If a dataset_id and series_id are given, then the name
 *	    of the corresponding dataseries of the dataset is returned.
 */
export function name_from_id(dataset_id: number, series_id?: number)
{
	// Attemt to locate the dataset witin the spec, based on the
	// provided dataset ID
	const set_index = DATA_SPEC.findIndex(
		(ds: Dataset) => ds.id === dataset_id); 
	if (DATA_SPEC[set_index] == undefined)
		return undefined;  // No matching dataset was found
	if (series_id == undefined)
		return DATA_SPEC[set_index].name;

	// If a series ID was provided, look for it within the dataset
	// we just found
	const series_index = DATA_SPEC[set_index].series.findIndex(
		(ds: Dataseries) => ds.id === series_id);
	if (DATA_SPEC[set_index].series[series_index] == undefined)
		return undefined;
	return DATA_SPEC[set_index].series[series_index].name;
}

