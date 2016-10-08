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
        params.kodiIP = instance.$('#KodiIP').val().trim();
        params.kodiUser = instance.$('#KodiUser').val().trim();
        params.kodiPassword = instance.$('#KodiPassword').val().trim();
        console.log(params);
        Meteor.apply('configKodi', [params], {wait: false});
    },
    'click button#NetatmoOk': function(event, instance) {
        Session.set('has-widget', true);
        var params = new Object();
        params.netatmoURL = instance.$('#NetatmoURL').val().trim();
        params.netatmoUser = instance.$('#NetatmoUser').val().trim();
        params.netatmoPassword = instance.$('#NetatmoPassword').val().trim();
        console.log(params);
        Meteor.apply('configNetatmo', [params], {wait: false});
    }
});

Template.ModalSettings.helpers({
    modalId: function() { return 'modal-settings';}
});


Template.ModalSettings.events({
    'click button#settingsOk': function(event, instance) {
        var dHomeIP = instance.$('#dhomeIP').val().trim();
        var dHomePort = instance.$('#dhomePort').val().trim();
        var dHomeKey = instance.$('#dhomeKey').val().trim();
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

        reconfigServer("http://" + dHomeIP + ":" + dHomePort + "/", dHomeKey);        
        instance.$('#modal-settings').modal('hide');;
    },
    'click button#discover': function(event, instance) {
        if(Meteor.isCordova) {
            zeroconf_discover(function(error, res) {
                if(!error) {
                    instance.$('#dhomeIP').val(res.ip);
                    instance.$('#dhomePort').val('7777');
                }
            });
        }
        else {
            alert(TAPi18n.__("Not supported for browser"));
        }
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
