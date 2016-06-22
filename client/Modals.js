Template.ModalAddRoom.events({
    "click button#ok": function(event, instance) {
        Meteor.apply('addGroup', [{
            name: instance.$('#inputRoomName').val(),
            parentId: null
        }], {wait: false});
    }
});
Template.ModalAddRoom.helpers({
    modalId: function() {
        return MODALS[0].id;
    }
});
Template.ModalAddScene.helpers({
    modalId: function() {
        return MODALS[1].id;
    }
});
Template.ModalAddScene.events({
    "click button#ok": function(event, instance) {
        console.log('add scene');
        Meteor.apply('addScene', [{
            name: instance.$('#inputSceneName').val()
        }], {wait: false});
    }
});

Template.ModalConfig.helpers({
    modalId: function() {
        return "modal-config";
    },
    dialogName: function() {
        return Session.get('dialog-name');
    }
});

Template.ModalConfig.events({
    'click button#KodiOk': function(event, instance){
        var params = new Object();
        params.kodiIP = instance.$('#KodiIP').val();
        params.kodiUser = instance.$('#KodiUser').val();
        params.kodiPassword = instance.$('#KodiPassword').val();
        console.log(params);
        Meteor.apply('configKodi', [params], {wait: false});
    },
    'click button#NetatmoOk': function(event, instance) {
        var params = new Object();
        params.netatmoURL = instance.$('#NetatmoURL').val();
        params.netatmoUser = instance.$('#NetatmoUser').val();
        params.netatmoPassword = instance.$('#NetatmoPassword').val();
        console.log(params);
        Meteor.apply('configNetatmo', [params], {wait: false});
    }
});

Template.ModalSettings.helpers({
    modalId: function() { return 'modal-settings';}
});

function reconfigServer(serverIP, serverPort) {
    window.localStorage.setItem("__root_url", "http://" + serverIP + ":" + serverPort + "/");
    Meteor.setTimeout(function() {
        window.location.reload();
    }, 1000);
}
/*function reconfigServer(serverIP, serverPort) {
    console.log('Reconfig Server:' + serverIP + " - " + serverPort);
    Meteor.connection = DDP.connect('http://' + serverIP + ":" + serverPort);
    _.each(['subscribe', 'methods', 'call', 'apply', 'status','reconnect','disconnect'], function (name) {
        Meteor[name] = _.bind(Meteor.connection[name], Meteor.connection);
    });

    Meteor.disconnect();
    Meteor.reconnect();
    
    delete Notifier;
    Notifier = new EventDDP("emohd");
    configNotifier();

    delete Device;
    Device = new Mongo.Collection('device');
    delete Group;
    Group = new Mongo.Collection('group');
    delete SceneDev; 
    SceneDev = new Mongo.Collection('scenedev');
    delete Task;
    Task = new Mongo.Collection('task');
    delete Favorite;
    Favorite = new Mongo.Collection('favorite');
    delete Scene;
    Scene = new Mongo.Collection('scene');

    Meteor.subscribe('data');

    delete Song;
    Song = new Mongo.Collection('song');
    delete PlayingItem;
    PlayingItem = new Mongo.Collection('playingItem');
    delete Progress;
    Progress = new Mongo.Collection('progress');
}*/

Template.ModalSettings.events({
    'click button#settingsOk': function(event, instance) {
        var dHomeIP = instance.$('#dhomeIP').val();
        var dHomePort = instance.$('#dhomePort').val();
        var dHomeKey = instance.$('#dhomeKey').val();
        if( !dHomeIP || dHomeIP.length <= 0) {
            console.log("-" + dHomeIP + "_");
            instance.$('#dhomeIP').parent().addClass('has-error');
            return;
        }
        if( !dHomePort || isNaN(dHomePort)) {
            console.log("-" + dHomePort + "_");
            instance.$('#dhomePort').parent().addClass('has-error');
            return;
        }
        if( !dHomeKey || dHomeKey.length <= 0) {
            instance.$('#dhomeKey').parent().addClass('has-error');
            return;
        }

        reconfigServer(dHomeIP, dHomePort);        
        instance.$('#modal-settings').modal('hide');;
    }
});

Template.ModalCurtainControl.onRendered(function(){
    Meteor.setTimeout(function() {
        this.$("button.btn").rippler({
            effectClass      :  'rippler-effect'
            ,effectSize      :  16      // Default size (width & height)
            ,addElement      :  'div'   // e.g. 'svg'(feature)
            ,duration        :  400
        });
    }, 100);
});

Template.ModalCurtainControl.helpers({
    curtainName: function() {
        return Session.get('curtain-name');;
    }
});
Template.ModalCurtainControl.events({
    'click #curtain-up': function(event, instance) {
        var id = parseInt(Session.get('curtain-id'));
        Meteor.apply('curtainUp', [id], {wait:false});
    },
    'click #curtain-down': function(event, instance) {
        var id = parseInt(Session.get('curtain-id'));
        Meteor.apply('curtainDown', [id], {wait:false});
    },
    'click #curtain-stop': function(event, instance) {
        var id = parseInt(Session.get('curtain-id'));
        Meteor.apply('curtainStop', [id], {wait:false});
    },
});
