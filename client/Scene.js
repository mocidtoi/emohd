var handle, handle1, handle2;
Template.Scene.onRendered(function() {
    var self = this;
    var timeoutHandle = null;
    CALLBACKS.saveBtn = function(){
        var sceneId = parseInt(Router.current().params.scid);
        var deviceObjs = self.$('li.column-1 input.mbsc-control');
        var actionObjs = self.$('li.last-column input.mbsc-control');
        var roomObjs = self.$('li.column-2 input.mbsc-control');
        var length = deviceObjs.size();
        for( var i = 0; i < length; i++ ) {
            var deviceObj = deviceObjs.eq(i);
            var actionObj = actionObjs.eq(i);
            var roomObj = roomObjs.eq(i);
            var sdId = parseInt(roomObj.attr('data-id'));
            var devId = parseInt(roomObj.attr('data-devId'));
            
            var actionVal = 0;
            if(actionObj.val() == "turn ON") actionVal = 1;
            else if(actionObj.val() == "turn OFF") actionVal = 0;
            else if(actionObj.val() == "TOGGLE") actionVal = 2;            

            var ret = Meteor.apply('updateSceneDev', [{
                id: sdId,
                devId: devId,
                sceneId: sceneId,
                action: actionVal
            }], {wait:false});
            console.log(ret);
        }
    }
    function initMobiscrolls() {
        timeoutHandle = null;
        var groups = Group.find({}, {fields:{name:1}}).fetch();
        $('li.column-1 .list-down').mobiscroll().select({
            theme: 'mobiscroll',
            lang: 'en',
            display: 'bottom',
            minWidth: 100,
            showInput:true,
            group: {
                groupWheel: true,
                header:false,
                clustered: true
            },
            //inputClass: "text-center",
            onSelect: function(valueText, inst) {
                var selectObj = this;
                var id = selectObj.getAttribute('data-id');
                var values = inst.getVal(false, true);
                console.dir(values);
                self.$('input[data-id="' + id + '"]').val(groups[values[0]].name).attr('data-devId', values[1]);
                Session.set('show-save-btn', true);
            }
        });
        $('li.last-column .list-down').mobiscroll().select({
            theme: 'mobiscroll',
            lang: 'en',
            display: 'bottom',
            inputClass: "text-right padding-right-4-percent",
            minWidth: 200,
            onSelect: function(valueText, inst) {
                Session.set('show-save-btn', true);
            }
        });
    }
    handle = Group.find().observe({
        added: function(room) {
            if( timeoutHandle != null) {
                Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            timeoutHandle = Meteor.setTimeout(initMobiscrolls, 500);
        }
    });
    handle1 = Device.find().observe({
        added: function(device) {
            if( timeoutHandle != null) {
                Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            timeoutHandle = Meteor.setTimeout(initMobiscrolls, 500);
        },
        changed: function(device) {
            if( timeoutHandle != null) {
                Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            timeoutHandle = Meteor.setTimeout(initMobiscrolls, 500);
        }
    });
    handle2 = SceneDev.find().observe({
        added: function(scenedev) {
            if( timeoutHandle != null) {
                Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            timeoutHandle = Meteor.setTimeout(initMobiscrolls, 500);
        },
        removed: function() {
            console.log("SceneDev removed");
            if( timeoutHandle != null) {
                Meteor.clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            timeoutHandle = Meteor.setTimeout(initMobiscrolls, 500);
        }
    });
});

Template.Scene.onDestroyed(function() {
    handle.stop();
    handle1.stop();
    handle2.stop();
});

Template.Scene.helpers(PageHelpers);
Template.Scene.helpers({
    scene: function() {
        var id = parseInt(Router.current().params.scid);
        return Scene.findOne({id:id});
    },
    scenedev: function() {
        var id = parseInt(Router.current().params.scid);
        return SceneDev.find({sceneId: id}).fetch();
    },
    device: function(id) {
        return Device.findOne({id:id});
    },
    room: function(roomId) {
        return Group.findOne({id:roomId});
    },
    rooms: function() {
        return Group.find().fetch();
    },
    devices: function(roomId) {
        return Device.find({
            groupId:roomId, $nor:[{type:Constants.DEVTYPE_SCENE}]
        }).fetch();
    },
    isSelected: function(roomId1, roomId2) {
        console.log(roomId1 + " - " + roomId2);
        return (roomId1 == roomId2)?"selected":"";
    }
});

Template.Scene.events({
    'click button': function(event, instance) {
        var id = parseInt(Router.current().params.scid);
        myConfirm(TAPi18n.__("Are you sure?"), 
            TAPi18n.__("Do you really want to remove this button?"), function() {
                Meteor.apply('removeScene', [id], {wait:false});
                Router.go(getBackLink());
            }
        );
    },
    'click a.addBtn': function(event, instance) {
        console.log('add scenedev');
        var id = parseInt(Router.current().params.scid);
        console.log(id);
        Meteor.apply('addSceneDev', [id], {wait:false});
    },
    'click a[data-action="remove-scenedev"]': function(event, instance) {
        var scid = parseInt(event.currentTarget.getAttribute('data-id'));
        myConfirm(TAPi18n.__("Are you sure?"), 
            TAPi18n.__("Do you really want to remove this device from this scene?"), function() {
                Meteor.apply('removeSceneDev', [scid], {wait:false});
            }
        );
    }
});
