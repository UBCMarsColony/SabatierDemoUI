import {app, BrowserWindow} from "electron";
const path = require('path')
const url = require('url')

let window: Electron.BrowserWindow = null;

// Wait until the app is ready
app.once('ready', () => {
	// Create a new window
	window = new BrowserWindow({
		// Set the initial width to 500px
		width: 1366,
		// Set the initial height to 400px
		height: 768,
		fullscreen: true,
		// set the title bar style
		titleBarStyle: 'hiddenInset',
		// set the background color to black
		backgroundColor: "#111",
		// Don't show the window until it's ready, this prevents any white flickering
		show: false,
		// Set icon to Sabatier project logo
		icon: path.join(__dirname, "../assets/sabatier-logo.png")
	})
	
	// Get the HTML file for the main window
	window.loadURL(path.join(__dirname, "../window.html"));
		
  	// Wait until the window is ready to show, then show it
	window.once('ready-to-show', () => {
		window.show();
	})  
})

