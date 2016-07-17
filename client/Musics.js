Template.Musics.onRendered(function(){
});
Template.Musics.events({
    'click #reload': function() {
        Meteor.apply('kodiReload', [], {wait:false}, function() {
            console.log('kodiReload');
            document.location.reload(true);
        });
    },
    'click .list-group-item': function(event, instance) {
        var songIdx = parseInt(event.currentTarget.getAttribute('data-songIdx'));
        var res = Meteor.apply('kodiPlay', [songIdx], {wait:false});
        console.log("** " + songIdx + " res: " + res);
    }
});

Template.Musics.helpers(PageHelpers);
Template.Musics.helpers({
    songCount: function() {
        return Song.find().count();
    },
    songs: function() {
        return Song.find().fetch();
    },
    isPlaying: function(songId) {
        if( PlayingItem.find().count() > 0 ) {
            var playingItem = PlayingItem.find().fetch()[0];
            return (songId == playingItem.id)?"ti-control-pause":"ti-control-play";
        }
        return "ti-control-play";
    }
});
