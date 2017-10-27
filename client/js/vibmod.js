
// Everything in this file added by Vibeke Bertelsen

// Tracks are muted and unmuted when the buttons are pressed
// 'Kicks' is the only element that affects other elements. So if for instance 'kicks' and 'bass'
// is enabled there will be a combined track called 'kicks&bass' that should be turned on.
// But if e.g. 'lead' and 'bass' are chosen there are two separate tracks called 'lead' and 'bass'
// that should be enabled

//There are more mods in sound.js line 364: function loadSong

//To-do:
//picture for 'og' tag
//Hide addthis till loaded?
//Message for mobile browsers
//Create tumblr and instagram animations
//Container div and see if it helps addthis bug
//sphere instead of bg plane



var songList = ["new mp3"];
var song = {"id":"new mp3","instruments":[
    {"name":"FX","sound":"FX.mp3"},
    {"name":"bass","sound":"bass.mp3"},
    {"name":"kicks&bass","sound":"kicks&bass.mp3"},
    {"name":"kicks&pad&bass","sound":"kicks&pad&bass.mp3"},
    {"name":"kicks&pad&toms&bass","sound":"kicks&pad&toms&bass.mp3"},
    {"name":"kicks&pad&toms","sound":"kicks&pad&toms.mp3"},
    {"name":"kicks&pad","sound":"kicks&pad.mp3"},
    {"name":"kicks&toms&bass","sound":"kicks&toms&bass.mp3"},
    {"name":"kicks&toms","sound":"kicks&toms.mp3"},
    {"name":"kicks","sound":"kicks.mp3"},
    {"name":"lead","sound":"lead.mp3"},
    {"name":"pad","sound":"pad.mp3"},
    {"name":"shaker echo + clap","sound":"shaker echo + clap.mp3"},
    {"name":"snare","sound":"snare.mp3"},
    {"name":"toms","sound":"toms.mp3"},
    {"name":"woof + clave","sound":"woof + clave.mp3"}
]}

//////////////////////////////////////

var hideTracks = true; //Can be turned off for debugging

//These are the names of the special elements that affect multiple tracks
var specialElements = [ 'bass', 'toms', 'pad', 'kicks'];

//Counts the progress of loading displayed in the modal window
var modalCounter = 0;

var modalMessages = [
    'Please wait while the music is loading. This will take a few minutes.',
    'Please turn on sound',
    'Change the music and visuals by pressing the buttons in the control panel',
    'Thank you for your patience',
    'Click the sound waves to jump to another part of the song',
]

/////////////////////////////////////
$(document).ready(function(){

    initDisableClicks();

    loopModalTexts();

    moveWaveCanvas();

    $(window).on("resize", initDisableClicks);
 
    $("#songs").on('songListLoaded', updateModalCounter); 
    $("#scenecanvas").on('meshReady', updateModalCounter);
    $("#scenecanvas").on('transformationDataReady', updateModalCounter);
    $("#scenecanvas").on('meshVisible', updateModalCounter);
    $("#songs").on('dropdownReady', updateModalCounter); 
    $("#songs").on('loadTracksStart', updateModalCounter); 
    $("#songs").on('loadingProgress', updateModalCounter); 

    $("#scenecanvas").on('meshVisible', showPlayer);    
    $("#songs").on('dropdownReady', triggerLoadSong); 
    $("#songs").on('dropdownReady', progressTimer); 
    $("#songs").on("tracksLoaded", createButtons); 
    $("#songs").on('tracksLoaded', triggerPlayButton);
    $("#songs").on('everythingLoaded', hideModal);
    $("#songs").on('everythingLoaded', hideDisableClicks);

    draggablePlayer();

    //Add some data to the 'song' object
    addVisibleToSongObject();

    moveAndResizeTrackCanvases();
});

////////////////////////////////////

function loopModalTexts() {    
    var i = 0;
    modalInterval = setInterval(function(){ 
        var msg = modalMessages[i];
        $("#modal-body #text").text(msg)
        i++;
        if (i ==  modalMessages.length)
            i = 0;
    }, 4000);
}

// Create a timer that sends an event after a given interval. This is because we don't have a 
// progress event when waiting for the tracks to be decoded
// so we simply use a timer in order to give people the impression that the loading is working
function progressTimer() {
  setTimeout(function(){ 
    $("#songs").trigger("loadingProgress"); 
  }, 10000);
}


function hideDisableClicks() {
    $("#disableClicks").hide();
}

// A div taht prevents clicks while page is loading
function initDisableClicks() {
    $("#disableClicks").click(function() { alert('Please wait until the page is done loading')});
    $("#disableClicks").width(window.innerWidth);
    $("#disableClicks").height(window.innerHeight);    
}

function showPlayer() {
    $("#player").css('display', 'block');
    $("#player").css('position', 'absolute');
}

function updateModalCounter() {
    modalCounter++;
    $("#modal #progress").text(modalCounter + "/7");
}

function hideModal() {
    clearInterval(modalInterval);
    $("#modal").hide();
}

function draggablePlayer() {
    $("#player").draggable({ 
        containment: 'window', 
        scroll: false, 
        handle: '#topbar' 
    })
}

function moveWaveCanvas() {
    $("#waveCanvas").detach().appendTo('#player #topPanel');
}

//This moves the track waveform displays up into our player
function moveAndResizeTrackCanvases() {
    //resize
    var height = SAMPLE_HEIGHT * returnVisibleCount(song.instruments);
    $('#myCanvas').prop('height', height);

    //move
    $("#canvass").detach().appendTo('#player #bottomPanel');
}

function triggerPlayButton() {
    $('#songs').trigger('everythingLoaded'); 

    window.setTimeout(function() {
        $("#bplay").click();    
    },2000);
}

function createButtons() {
    var html = "";
    song.instruments.forEach( function(instrument) {
        if (instrument.visible == false)
            return; //Skip drawing this button
        if (specialElements.includes(instrument.name)) {
            html += '<a class="enableTrack down ' +  makeSafeForCSS(instrument.name) + '" title="' + instrument.name + '"></a>';
        } else {
            html += '<a class="simpleTrackToggle down ' +  makeSafeForCSS(instrument.name) + '" title="' + instrument.name + '"></a> ';
        }
    });
    $("#player #bottomPanel #buttons").append(html);

    setTracksState();

    addEventHandlers();
}

function setTracksState() {
    $('a.enableTrack').each(function(){
     //Mute a lot of the tracks according to button state
     muteTracksFromSongElementsState(this);

     //then unmute the one track that should be played
     var combinedTrack = unmuteCombinedTrackFromSongElementsState();  

     //If there is no combined track unmute the individual tracks
     if (!combinedTrack)
         unmuteIndividualTracksFromSongElementState();
    });
}

function triggerLoadSong() {
    $('#songSelect>option:eq(1)').prop('selected', true).trigger('change');
}

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

        //Set waveform drawing visibility
        toggleWaveformVisible($(this));
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

        toggleWaveformVisible($(this));
	}); 

    //Toggle play/pause/stop buttons css
    $('#player #topPanel #buttons > div').mousedown(function(){
        $(this).addClass("down");
    }).
    mouseup(function() {
        $(this).removeClass("down");
    });

    //Toggle play/pause/stop actions
    $('#player #topPanel #buttons .play').mousedown(function(){
        playAllTracks(0);
    })

    $('#player #topPanel #buttons .pause').mousedown(function(){
        pauseAllTracks();
    })

    $('#player #topPanel #buttons .stop').mousedown(function(){
        stopAllTracks();
    })
}

//Iput the jquery element of a track button
//sets the waveform drawing visibility based on the button state
function toggleWaveformVisible(jqueryEl) {
    elName = $(jqueryEl).attr('title');
    var index = findIndexInInstrumentsArray(elName);

    if ($(jqueryEl).hasClass('down')) {
        drawBlack($(jqueryEl).index(), false);
    } else {
        drawBlack($(jqueryEl).index(), true);
    }
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

function returnVisibleCount(instruments) {
    count = 0;
    instruments.forEach( function(instr) {
        if (instr.visible == true) {
            count++;
        }
    });
    return count;
}

function muteTracksFromSongElementsState(button) {

	var songElements = createSongElementsArray();

    console.log("songElements", songElements);
    console.log("instruments", song.instruments);

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

function makeSafeForCSS(name) {
    return "__" + name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
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

//Draws a black bar covering the track waveform
//Input the index of the track
//Mode: true draw or false delete black bar
function drawBlack(index,mode) {
    var blackCanvas = document.getElementById("blackCanvas");
    var x = 0;
    var y = index * SAMPLE_HEIGHT;
    var width = blackCanvas.width;
    var height = SAMPLE_HEIGHT;
    var ctx = blackCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    if (mode == true) {
        ctx.fillRect(x, y, width, height);
    } else {
        ctx.clearRect(x, y, width, height);
    }
}
