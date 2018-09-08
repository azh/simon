var KEYS = ['c', 'd', 'e', 'f']
var NOTE_DURATION = 1000
var BOX_UID = 0
// NoteBox
//
// Acts as an interface to the coloured note boxes on the page, exposing methods
// for playing audio, handling clicks,and enabling/disabling the note box.

var HANDLERS = []
function NoteBox(key, onClick) {
	// Create references to box element and audio element.
	this.boxEl = document.getElementById(key);
	var audioEl = document.getElementById(key + '-audio');
	if (!this.boxEl) throw new Error('No NoteBox element with id' + key);
	if (!audioEl) throw new Error('No audio element with id' + key + '-audio');

	// When enabled, will call this.play() and this.onClick() when clicked.
	// Otherwise, clicking has no effect.
	this.enabled;
	this.id = BOX_UID
	BOX_UID += 1
	// Counter of how many play calls have been made without completing.
	// Ensures that consequent plays won't prematurely remove the active class.
	var playing = 0;

	this.key = key;
	this.onClick = onClick || function () {};

	// Plays the audio associated with this NoteBox
	this.play = () => {
		playing++;
		// Always play from the beginning of the file.
		audioEl.currentTime = 0;
		audioEl.play();

		// Set active class for NOTE_DURATION time	
		this.boxEl.classList.add('active');
		setTimeout(() => {
			playing--
			if (!playing) {
				this.boxEl.classList.remove('active');
			}
		}, NOTE_DURATION)
	}

	// Enable this NoteBox
	this.enable = function () {
		this.enabled = true;
	}

	// Disable this NoteBox
	this.disable = function () {
		this.enabled = false;
	}

	// Call this NoteBox's clickHandler and play the note.
	this.clickHandler = () => {
		if (!this.enabled) return;

			this.onClick(this.key)
			this.play()
	}
	HANDLERS.push(this.clickHandler)

	HANDLERS.forEach(h => this.boxEl.removeEventListener('mousedown', h))
	if (this.onClick !== undefined) {
		this.boxEl.addEventListener('mousedown', this.clickHandler);
	}
}

var ECHO_WAIT_DURATION = 2500
var NOTE_QUEUE = []
var NOTES = {}

const MODE = {
	echoMode: function () {
		let timeout = null
		let echo = null
		let playing = false

		this.onClick = () => { 
			if (playing) {
				NOTE_QUEUE = []
				playing = false
			}
			clearTimeout(timeout)
			clearInterval(echo)
			timeout = setTimeout(() => {
				playing = true
				echo = setInterval(() => {
					if (NOTE_QUEUE.length > 0) {
						let note = NOTE_QUEUE.shift()
						note.play()
					}
				}, NOTE_DURATION)
			}, ECHO_WAIT_DURATION)
		}

		this.onChange = () => {
			clearTimeout(timeout)
			clearInterval(echo)
		}
	},

	simonMode: function (playerMove) {
		let simonQueue = []

		if (playerMove) {
			KEYS.forEach(k => NOTES[k].enable())
		} else {
			KEYS.forEach(k => NOTES[k].disable())
			NOTE_QUEUE.push(NOTES[KEYS[Math.floor(Math.random() * KEYS.length)]])
			simonQueue = NOTE_QUEUE.slice(0)
			let play = setInterval(() => {
				if (simonQueue.length > 0) {
					let note = simonQueue.shift()
					note.play()
				} else {
					clearInterval(play)
					MODE.simonMode(true)
				}
			}, NOTE_DURATION)
		}

		this.onClick = function (key) {
			if (NOTES[key].enabled) {
				simonQueue.push(NOTES[key])
				if (NOTE_QUEUE[simonQueue.length - 1].key !== key) {
					KEYS.forEach(k => NOTES[k].disable())
					KEYS.forEach(k => NOTES[k].play())
					simonQueue = []
					NOTE_QUEUE = []
					setTimeout(() => MODE.simonMode(false), ECHO_WAIT_DURATION)
				} else {
					if (simonQueue.length === NOTE_QUEUE.length) {
						simonQueue = []
						MODE.simonMode(false)
					} 
				}
			}
		}

		this.onChange = () => {
			simonQueue = []
		}
	}
}

var CURRENT_MODE
var CURRENT_MODE_ID

KEYS.forEach(key => {
	NOTES[key] = new NoteBox(key, () => {})
})

changeMode(0)

function changeMode(modeId) {
	CURRENT_MODE_ID = modeId
	NOTE_QUEUE = []

	if (CURRENT_MODE !== undefined) {
		CURRENT_MODE.onChange()
	}

	let s = document.getElementById('mode-view')
	if (parseInt(modeId) === 0) {
		CURRENT_MODE = new MODE.echoMode()
		KEYS.forEach((key) => {
			NOTES[key].onClick = () => {
				CURRENT_MODE.onClick(key)
				NOTE_QUEUE.push(NOTES[key])
			}		
			NOTES[key].enable()
		})
		s.setAttribute("value", "Echo")
	} else if (parseInt(modeId) === 1) {
		CURRENT_MODE = new MODE.simonMode(false)
		KEYS.forEach((key) => {
			NOTES[key].onClick = () => {
				CURRENT_MODE.onClick(key)
			}		
		})

		s.setAttribute("value", "Simon")
	}	
}
