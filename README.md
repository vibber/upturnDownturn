# upturnDownturn
This is my interactive audiovisual sculpture for the track Upturn Downturn by max anxd

The audio playback is based on the MT5 multitrack audio player. https://github.com/squallooo/MT5

# Note to self

Made some changes so that a node server is not needed. This however means that the names of tracks must be manually pasted into the code in settings.js as javascript cannot automatically get names of files in a directory.

There is however the node server from the original MT5 player. So you could put the audio files into a directory under 'multitrack' and then start 'node server.js' and then go to http://0.0.0.0:3000/track/upturn%20downturn%20qual%202 to get the json object to put into settings.js

# Max Anxd

https://soundcloud.com/maxanxd