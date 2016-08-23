var handle;
Template.Rooms.onRendered(function() {
    var self = this;
    Session.set("title", "Rooms");
    var timeoutHandle = null;
    handle = Device.find().observe({
        added: function(arg) {
            if(arg.type == Constants.DEVTYPE_SCENE) {
                if (timeoutHandle != null) {
                    Meteor.clearTimeout(timeoutHandle);
                }
                timeoutHandle = Meteor.setTimeout(function() {
                    console.log('Rippler');
                    self.$(".item-scene").rippler({
                        effectClass      :  'rippler-effect'
                        ,effectSize      :  16      // Default size (width & height)
                        ,addElement      :  'div'   // e.g. 'svg'(feature)
                        ,duration        :  400
                    });
                    self.$(".item-curtain").rippler({
                        effectClass      :  'rippler-effect'
                        ,effectSize      :  16      // Default size (width & height)
                        ,addElement      :  'div'   // e.g. 'svg'(feature)
                        ,duration        :  400
                    });
                    timeoutHandle = null;
                }, 100);
            }
        },
        /*
        changed: function(arg) {
            var elemObj = self.$('.list-group-item[data-id="' + arg.id + '"]');
            elemObj.addClass('bg-indigo-800');
            Meteor.setTimeout(function() {
                elemObj.removeClass('bg-indigo-800'); 
            }, 1000);
        }*/
    });
});

Template.Rooms.onDestroyed(function() {
    handle.stop();
});
Template.Rooms.helpers(PageHelpers);
Template.Rooms.helpers({
	device: function(gid) {
        var cursor = Device.find({ groupId: gid }).fetch();
        if( cursor.length > 0) return cursor;
		return [{removable:true, roomId:gid}];
	},
	isOn: isDevOn,
    statusClass: function(type, id) {
        switch(parseInt(type)) {
        case Constants.DEVTYPE_CURTAIN:
            return "item-curtain rippler-default";
            break;
        case Constants.DEVTYPE_SCENE:
            return "item-scene rippler-default";
            break;
        default:
            try {
                return Device.findOne(id).status == 49?"item-device":"item-device off";
            }
            catch(err) {
                return "item-device";
            }
        }
    },
    icon: function(typeId) {
        return IconList[typeId].icon;
    },
	group: function() {
		return Group.find({ parentId: null }).fetch();
	}
});

Template.Rooms.events({
    'click .removeAction': function(event) {
        var target = event.currentTarget;
        var id = parseInt(target.getAttribute('data-room-id'));
        myConfirm(TAPi18n.__("Are you sure?"), TAPi18n.__("Do you really want to remove this room?"),function(){
            Meteor.apply('removeGroup', [id], {wait: false});
        });
    },
    'click a[data-target="#add_device"]': function(event) {
        var roomId = event.currentTarget.getAttribute("data-room-id");
        Session.set("room-id", roomId);
    },
    'click .list-group-item.item-device,.list-group-item.item-scene': function(event) {
        var devId = parseInt(event.currentTarget.getAttribute('data-id'));
        console.log("Rooms, device toggle " + {
			id: devId,
			act: isDevOn(devId)?'off':'on'
		});
		Meteor.apply('com', [{
			id: devId,
			act: isDevOn(devId)?'off':'on'
		}], {wait: false});
    },
    'click .list-group-item.item-curtain': function(event,instance) {
        Session.set('curtain-name', event.currentTarget.getAttribute('data-name'));
        Session.set('curtain-id', event.currentTarget.getAttribute('data-id'));
        $('#curtain-control').modal();
    },
    'click .list-group-item a': function(event) {
        event.stopPropagation();
    }
});

