// SETTINGS
// Everything in this file added by Vibeke Bertelsen

// Tracks are muted and unmuted when the buttons are pressed
// 'Kicks' is the only element that affects other elements. So if for instance 'kicks' and 'bass'
// is enabled there will be a combined track called 'kicks&bass' that should be turned on.
// But if e.g. 'lead' and 'bass' are chosen there are two separate tracks called 'lead' and 'bass'
// that should be enabled

var songList = ["upturn downturn qual 2"];
var song = {"id":"upturn downturn qual 2","instruments":[{"name":"FX","sound":"FX.ogg"},{"name":"bass","sound":"bass.ogg"},{"name":"kicks&bass","sound":"kicks&bass.ogg"},{"name":"kicks&lead&bass","sound":"kicks&lead&bass.ogg"},{"name":"kicks&lead&pad&bass","sound":"kicks&lead&pad&bass.ogg"},{"name":"kicks&lead&pad&toms&bass","sound":"kicks&lead&pad&toms&bass.ogg"},{"name":"kicks&lead&pad&toms","sound":"kicks&lead&pad&toms.ogg"},{"name":"kicks&lead&pad","sound":"kicks&lead&pad.ogg"},{"name":"kicks&lead&toms&bass","sound":"kicks&lead&toms&bass.ogg"},{"name":"kicks&lead&toms","sound":"kicks&lead&toms.ogg"},{"name":"kicks&lead","sound":"kicks&lead.ogg"},{"name":"kicks&pad&bass","sound":"kicks&pad&bass.ogg"},{"name":"kicks&pad&toms&bass","sound":"kicks&pad&toms&bass.ogg"},{"name":"kicks&pad&toms","sound":"kicks&pad&toms.ogg"},{"name":"kicks&pad","sound":"kicks&pad.ogg"},{"name":"kicks&toms&bass","sound":"kicks&toms&bass.ogg"},{"name":"kicks&toms","sound":"kicks&toms.ogg"},{"name":"kicks","sound":"kicks.ogg"},{"name":"lead","sound":"lead.ogg"},{"name":"pad","sound":"pad.ogg"},{"name":"shaker echo + clap","sound":"shaker echo + clap.ogg"},{"name":"snare","sound":"snare.ogg"},{"name":"toms","sound":"toms.ogg"},{"name":"woof + clave","sound":"woof + clave.ogg"}]}

//////////////////////////////////////

var hideTracks = true; //Can be turned off for debugging

//These are the names of the special elements that affect multiple tracks
var specialElements = [ 'bass', 'toms', 'pad', 'kicks', 'lead'];

/////////////////////////////////////

//Add button event handlers
$(document).ready(function(){

    //Add some data to the 'song' object
    addVisibleToSongObject();

});

function addEventHandlers() {
	//Toggle buttons css
    $('a.enableTrack').click(function(){
        $(this).toggleClass("down");
    });

    //Toggle button behaviour for the elements that affects multiple tracks
    $('a.enableTrack').click(function(){
    	//First mute a lot of the tracks
		muteTracksFromSongElementsState(this);
 		
 		//then unmute the one track that should be played
        var combinedTrack = unmuteCombinedTrackFromSongElementsState();  

        //If there is no combined track unmute the individual tracks
        if (!combinedTrack)
        	unmuteIndividualTracksFromSongElementState();
    });

    //Toggle button css
    $('a.simpleTrackToggle').click(function() {
    	$(this).toggleClass("down");
    });

    //A toggle button for a track. Simply mutes/unmutes the track
    $('a.simpleTrackToggle').click(function() {
    	elName = $(this).attr('title');
    	var index = findIndexInInstrumentsArray(elName);
    	muteUnmuteTrack(index);
	});    
}

//Look up a track name in the song.instruments aray and return the index of it
function findIndexInInstrumentsArray(name) {
	for(var i = 0; i < song.instruments.length; i++) {
		if (song.instruments[i].name == name)
			return i;
	};
	return -1;
}

// "&" in the name of a track means it's a combined track
// These tracks should not be visible as we want only the individual
// tracks to be visible
function addVisibleToSongObject() {
	song.instruments.forEach( function(instr) {
		if (hideTracks)
			instr.visible = instr.name.indexOf("&") == -1 ? true : false;
		else
			instr.visible = true;
	})
}

function muteTracksFromSongElementsState(button) {
	var songElements = createSongElementsArray();

	songElements.forEach(function(el) {
		songElementName = el.name;
        song.instruments.forEach(function(instr, i) {
        	if (instr.name.indexOf(songElementName) != -1) {
        		//console.log("mute track", instr.name)
        		muteTrack(i);
        	}
        }); 		
	})
}

/*
// Analyze the song elements (the buttons marked 'bass', 'toms' etc) and disable 
// the appropriate tracks
function old_muteTracksFromSongElementsState(button) {
    var songElementName = $(button).attr('title');
    console.log("pressed button", songElementName, "ready to mute");
	//Button up: Disable all tracks with e.g. 'bass' in it
//	if (!$(button).hasClass("down")) {
        song.instruments.forEach(function(obj, i) {
        	if (obj.name.indexOf(songElementName) != -1) {
        		console.log("mute track", obj.name)
        		muteTrack(i);
        	}
        });  		
	// } else {
	// 	//Button down: Disable all
	//     song.instruments.forEach(function(obj, i) {
 //        	muteTrack(i);
 //        });  		
	// }
}
*/

// Analyze the song elements (the buttons marked 'bass', 'toms' etc) and enable the correct combined track
function unmuteCombinedTrackFromSongElementsState () {
	var songElements = createSongElementsArray();
	
	// Run through song tracks and isolate the correct track with all 
	// enabled song elements and none of the disabled ones
	//song.instruments.forEach(function(track, i) {
	for(var i = 0; i < song.instruments.length; i++) {
		var track = song.instruments[i];
		//enable combined track
		if (allEnabledFoundInString(songElements, track.name) &&
		   noDisabledFoundInString(songElements, track.name)) {
			unmuteTrack(i);
			console.log('unmute track',track.name)	
			return true;		
		} 
	}
	//});
}

//Run through all tracks and enable the ones that match the active song elements
function unmuteIndividualTracksFromSongElementState() {
	var songElements = createSongElementsArray();

	song.instruments.forEach(function(track, i) {
		songElements.forEach(function(el) {
			if (el.enabled && el.name == track.name) {
				unmuteTrack(i);
				console.log("unmute individual track", track.name)
			}
		});
	});
}


//Create an array of the song elements (the buttons) and whether they are enabled or not
// Example of object: { "name": "bass", enabled: true }
function createSongElementsArray() {
	var songElements = [];
	$('a.enableTrack').each(function(i) {
		elName = $(this).attr('title');
		if ($(this).hasClass("down")) {
			songElements.push({"name": elName, enabled: true });
		} else {
			songElements.push({"name": elName, enabled: false });
		}
	});
	return songElements;
}

// Input an array of song elements to search for and a string to search in. 
// Returns true if all enabled song elements are found
function allEnabledFoundInString(arrayToFind, string) {
	var allEnabledFound = true;
	arrayToFind.forEach(function(el) {
		if(el.enabled == true && string.indexOf(el.name) == -1)
			allEnabledFound = false;
	})
	return allEnabledFound;
}

// Input an array of song elements to search for and a string to search in. 
// Returns true if none of the disabled song elements are found
function noDisabledFoundInString(arrayToFind, string) {
	var noDisabledFound = true;
	arrayToFind.forEach(function(el) {
		if(el.enabled == false && string.indexOf(el.name) != -1)
			noDisabledFound = false;
	})
	return noDisabledFound;
}

//Variation of the original muteUnmuteTrack function
function muteTrack(trackNumber) {
    var m = document.querySelector("#mute" + trackNumber);
    var s = document.querySelector("#solo" + trackNumber);

    var currentTrack = currentSong.tracks[trackNumber];

    $(m).addClass("activated");

    // Track was not muted, let's mute it!
    currentTrack.muted = true;
    
    if (m != null) {
	    // let's change the button's class
    	m.innerHTML = "<span class='glyphicon glyphicon-volume-off'></span>";
    }

    // In all cases we must put the track on "no solo" mode
    currentTrack.solo = false;
    $(s).removeClass("activated");

    if (s != null) {
    	// Let's change the icon
	    s.innerHTML = "<img src='../img/earphones.png' />";
    }

    // adjust track volumes dependinf on all mute/solo states
    currentSong.setTrackVolumesDependingOnMuteSoloStatus();
}

//Variation of the original muteUnmuteTrack function
function unmuteTrack(trackNumber) {
    var m = document.querySelector("#mute" + trackNumber);
    var s = document.querySelector("#solo" + trackNumber);

    var currentTrack = currentSong.tracks[trackNumber];

    $(m).removeClass("activated");

    // track was muted, let's unmute it!
    currentTrack.muted = false;
    if (m!=null) {
	    m.innerHTML = "<span class='glyphicon glyphicon-volume-up'></span>";
    }

    // In all cases we must put the track on "no solo" mode
    currentTrack.solo = false;
    $(s).removeClass("activated");
    if (s != null) {
	    // Let's change the icon
    	s.innerHTML = "<img src='../img/earphones.png' />";    	
    }

    // adjust track volumes dependinf on all mute/solo states
    currentSong.setTrackVolumesDependingOnMuteSoloStatus();
}
