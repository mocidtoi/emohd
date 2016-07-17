var http = Npm.require('request');
kodiScan = function() {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'AudioLibrary.Scan',
        id: 'scanMusic'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    console.log(url);
}

kodiLoadSongs = function(callback) {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'AudioLibrary.GetSongs',
        params: {
            properties: ["track"], 
            sort: {
                order: "ascending",
                method: "label",
                ignorearticle: true
            },
        },
        id: 'getSongs'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    http.get(url, callback);
}

kodiClearPlaylist = function(id, callback) {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Playlist.Clear',
        params: {
            playlistid:id
        },
        id: 'clearPlaylist'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    console.log('kodiClearPlaylist ' + url);
    http.get(url, callback).on('error',function(err) {
        console.log(err);
    });
}

kodiPlaylistAdd = function(plid, id) {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Playlist.Add',
        params: {
            playlistid:plid,
            item: {
                songid: id
            }
        },
        id: 'addSong'
    };
    console.log(tempReq);
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    http.get(url, function(err, res) {
//        console.log(res.body);
    });
}

kodiPlaylistGetItems = function(plid, callback) {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Playlist.GetItems',
        params: {
            playlistid:plid,
            properties: ["title", "duration"]
            
        },
        id: 'musicPlaylist'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    console.log(url);
    http.get(url, function(err, res){
        if(res && res.body) {
            var json = JSON.parse(res.body);
            if(json.result.items) {
                json.result.items.forEach(callback);
            }
        }
    });
}

function getActivePlayer(callback) {
    callback(0);
}

function KodiTracker(publisher) {
    this.publisher = publisher;
    this.publisher.added('playingItem', 0, {title:'',duration:-1,artist:''});
    this.publisher.added('progress', 0, {percentage:0.0, position:-1, totaltime:{}});
    this.timerHandle1 = null;
    this.timerHandle2 = null;
}
KodiTracker.prototype.start = function() {
    var self = this;
    getActivePlayer(function(playerId) {
        var tempReq1 = {
            jsonrpc:'2.0',
            method: 'Player.GetItem',
            id: 'AudioGetItems',
            params: {
                playerid:playerId,
                properties: ["title", "artist", "duration"]
            }
        };
        var tempReq2 = {
            jsonrpc:'2.0',
            method: 'Player.GetProperties',
            id: 'AudioGetProperties',
            params: {
                playerid:playerId,
                properties: ["percentage", "totaltime", "position", "speed", "shuffled"]
            }
        };
        var url1 = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq1);
        var url2 = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq2);
        function trackSong() {
            http.get(url1, function(err, res){
                if(res && res.body) {
                    var json = JSON.parse(res.body);
                    if(json.result && json.result.item) {
                        self.publisher.changed('playingItem', 0, json.result.item);
                    }
                }
            });
        }
        function trackProgress() {
            http.get(url2, function(err, res){
                if(res && res.body) {
                    var json = JSON.parse(res.body);
                    if(json.result) {
                        self.publisher.changed('progress', 0, json.result);
                    }
                }
            });
        }
        trackSong();
        self.timerHandle1 = Meteor.setInterval( trackSong, 20000 );
        self.timerHandle2 = Meteor.setInterval( trackProgress, 2000);
    });
}
KodiTracker.prototype.stop = function(){
    Meteor.clearInterval(this.timerHandler1);
}

kodiPlay = function(songIdx, callback) {
    console.log("kodiPlay: " + songIdx);
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Player.Open',
        id: 'playSong',
        params: {
            item: {
                playlistid:0,
                position: songIdx
            }
        }
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    console.log(url);
    http.get(url, callback);
}

kodiPlayPause = function() {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Player.PlayPause',
        params: {
            playerid:0
        },
        id: 'playpause'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    console.log(url);
    http.get(url, function(err, res){
        console.log(url);
        console.log(err);
        if(res && res.body) console.log(res.body);
    });
}

kodiNext = function() {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Player.GoTo',
        params: {
            playerid:0,
            to: "next"
        },
        id: 'nextSong'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    http.get(url, function(err, res){
        console.log(url);
        console.log(err);
        if(res && res.body) console.log(res.body);
    });
}

kodiPrevious = function() {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Player.GoTo',
        params: {
            playerid:0,
            to: "previous"
        },
        id: 'previousSong'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    http.get(url, function(err, res){
        console.log(url);
        console.log(err);
        if(res && res.body) console.log(res.body);
    });
}

var state = false;

kodiShuffle = function() {
    state = !state;
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Player.SetShuffle',
        params: {
            playerid:0,
            shuffle: state
        },
        id: 'Suffle'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    http.get(url, function(err, res){
        console.log(url);
        console.log(err);
        if(res && res.body) console.log(res.body);
    });
}

kodiGetVolume = function(callback) {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Application.GetProperties',
        params: {
            properties: ["volume"]
        },
        id: 'getVolume'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    http.get(url, function(err, res) {
        console.log(url);
        if(res && res.body) {
            var json = JSON.parse(res.body);
            if(json.result) callback(json.result.volume);
            else callback(0);
        }
        else callback(0);
    });
}

kodiSetVolume = function(volume) {
    var tempReq = {
        jsonrpc:'2.0',
        method: 'Application.SetVolume',
        params: {
            volume: volume
        },
        id: 'setVolume'
    };
    var url = 'http://' + kodiUser + ":" + kodiPassword + "@" + kodiIP + '/jsonrpc?request=' + JSON.stringify(tempReq);
    http.get(url, function(err, res){
        console.log(url);
        console.log(err);
        if(res && res.body) console.log(res.body);
    });
}

Meteor.methods({
    kodiReload: function() {
        kodiClearPlaylist(0, function(err, res) {
            console.log("res:" + res);
        });
        kodiLoadSongs(function(err, res) {
            var json = JSON.parse(res.body);
            if( json.result.songs ) {
                json.result.songs.forEach(function(song, index) {
                    kodiPlaylistAdd(0, song.songid);
                });
            }
        });
    },
    kodiPlay: function(songIdx) {
        var future = new Future();
        kodiPlay(songIdx, function(err, res) {
            future.return();
        });
        future.wait();
        kodiTracker.stop();
        kodiTracker.start();
    },
    kodiGetVolume: function() {
        var future = new Future();
        var toRet = {success:false};
        kodiGetVolume(function(volume) {
            toRet.success = true;
            toRet.volume = volume;
            future.return();
        });
        future.wait();
        return toRet;
    },
    kodiSetVolume: function(volume) {
        console.log("kodiSetVolume");
        kodiSetVolume(volume);
    },
    kodiNext: function() {
        kodiNext();
    },
    kodiPrevious: function() {
        kodiPrevious();
    },
    kodiPlayPause: function() {
        kodiPlayPause();
    },
    kodiShuffle: function() {
        kodiShuffle();
    }
});
var kodiTracker = null;
Meteor.publish('music', function() {
    var self = this;
    kodiPlaylistGetItems(0, function(song, index) {
        self.added('song', song.id, song);
    });

    kodiTracker = new KodiTracker(self);
    kodiTracker.start();
   
    self.onStop(function() {
    });
    self.ready();
});
