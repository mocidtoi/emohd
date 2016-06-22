Template.Player.onRendered(function(){
    var self = this;
    Meteor.setTimeout(function() {
        var connectSlider = document.getElementById('slider-connect');

        noUiSlider.create(connectSlider, {
            start: 40,
            connect: 'lower',
            range: {
                'min': 0,
                'max': 100
            }
        });
        /*
        var range = document.getElementById('range');

        noUiSlider.create(range, {
            start: 40,
            connect: 'lower',
            direction: 'rtl',
            orientation: 'vertical',
            range: {
                'min': 0,
                'max': 100
            }
        });
        range.setVolumeTimer = null;
        range.noUiSlider.on('update', function(values, handle){
            if(range.setVolumeTimer) {
                Meteor.clearTimeout(range.setVolumeTimer);
                range.SetVolumeTimer = null;
            }
            range.setVolumeTimer = Meteor.setTimeout(function() {
                console.log('Set volume');
                Meteor.apply('kodiSetVolume', [parseInt(values[handle])], {wait:false});
                range.setVolumeTimer = null;
            }, 500);
        });
        */
        self.$('#vtune').mobiscroll().select({
            theme: 'mobiscroll', 
            lang: 'en', 
            display: 'bottom', 
            minWidth: 100,
            showInput: false,
            onSelect: function(valueText, inst) {
                console.log("Volume changed " + inst.getVal());
                Meteor.apply('kodiSetVolume', [parseInt(inst.getVal())], {wait:false});
            }
        });
    }, 300);
    Progress.find().observe({
        changed: function(progress) {
            var connectSlider = document.getElementById('slider-connect');
            connectSlider.noUiSlider.set([Math.round(progress.percentage)]);
        }
    });
});


Template.Player.events({
    'click #volume-bt': function(event, instance) {
        Meteor.apply('kodiGetVolume', [], {wait:false}, function(error, result) {
            instance.$('#vtune').val(Math.round(result.volume/10) * 10);
            var inst = instance.$('#vtune').mobiscroll('getInst');
            inst.show();
        });
    },
    'click a[data-action]': function(event, instance) {
        var dataAction = event.currentTarget.getAttribute('data-action');
        console.log("clicked " + dataAction);
        switch(parseInt(dataAction)) {
        case Constants.PLAYPAUSE:
            console.log("Play pause");
            Meteor.apply('kodiPlayPause', [], {wait:false}, function(err, res){});
            break;
        case Constants.NEXT:
            console.log("Next");
            Meteor.apply('kodiNext', [], {wait:false});
            break;
        case Constants.PREVIOUS:
            console.log("Previous");
            Meteor.apply('kodiPrevious', [], {wait:false});
            break;
        case Constants.SHUFFLE:
            console.log("Shuffle");
            Meteor.apply('kodiShuffle', [], {wait:false});
            break;
        }
    }
});

Template.Player.helpers({
    title: function() {
        try {
            return PlayingItem.find().fetch()[0].title;
        }
        catch(err) {
        }
    },
    duration: function() {
        var prog = Progress.find().fetch()[0];
        if(prog.totaltime.minutes && prog.totaltime.seconds)  
            return prog.totaltime.minutes + ":" + prog.totaltime.seconds;
        return "0:00";
    },
    isPlaying: function() {
        try {
            return (Progress.find().fetch()[0].speed == 1)?"ti-control-pause":"ti-control-play";
        }
        catch(err) {
            return "ti-control-play";
        }
    },
    isOn: function() {
        try {
            return Progress.find().fetch()[0].shuffled?"active":"";
        }
        catch(err) {
            return "";
        }
    }
});
