# Notes

## Planning

- Decided to implement the tasks as modes which can be set

## Implementation

- Totally forgot how to work with JavaScript classes
	- Spent an hour or two getting familiar with new, this, scoping, etc. the hard way
- The way `changeMode()` creates a new instance of a mode every time might be a code smell, but it works and doesn't cause any apparent issues
	- Pretty sure there isn't much if any benefit to using a pre-defined list of the 3 modes
- Added a slider to the document for changing modes
	- Got caught for an unpleasantly long time on how the slider doesn't actually return a number

### Echo

- Went pretty easily
- Made it enable every `NoteBox` in case the mode is abruptly changed from Simon to Echo

### Simon

- Spent a great deal of time trying to do some showy stuff with generators before giving up and figuring out this ultimately cleaner way
- Switching from Echo to Simon mode, the new note boxes would retain the behaviour of the previous ones, even after `NOTES` was reset in a variety of increasingly exotic ways
	- I'm not proud of how much grief and suffering and misguided rage towards `this` and scoping I underwent before I realized that every time I made a new `NoteBox`, it added an event listener for `clickHandler`. Whoops.
	- A couple of `this.` and `=>` additions and `function` deletions later, I thought I was good to go. Unfortunately, making `boxEl` a member of `NoteBox` didn't make the event handlers go away with their instances like I'd hoped it would.
	- I tried a solution from StackOverflow that clones and replaces the node to remove all of the event listeners before adding fresh ones, but it was definitely cursed, as it made parts of the app behave erratically even when the code shouldn't have been run yet.
	- After far too long, I managed to get rid of all the spare handlers by storing them all in a global and clearing them all every new batch of `NoteBox`es.
	- I think the saddest thing is that in the end I realized I didn't even have to make new `NoteBox`es every time, I could just directly set `onClick` to something else, avoiding basically all of this behaviour.

## Conclusion

I should have just put the Simon mode into a different JavaScript and HTML file and made the slider change pages. Thanks for coming to my TED talk.
