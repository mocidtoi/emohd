console.log('eventDDP');

configNotifier = function() {
    console.log("Config Notifier");
    Notifier.addListener('joininfo', function(message) {
        var response = JSON.parse(message);
        Session.set('netaddr', response.netadd);
        Session.set('endpoint', response.endpoint);
        console.log("Notifier event");
        var foundGangs = [null, null, null, null];
        Device.find({
            netadd: parseInt(response.netadd, 16),
            endpoint: response.endpoint
        }, 
        {
            fields: {
                idx:1, idx1:1, id: 1, type:1, groupId:1, name:1
            }
        }).forEach(function(device){
            var idx = parseInt(String.fromCharCode(device.idx));
            foundGangs[idx] = device;
            if(device.idx1 != null && device.idx1 != undefined) {
                foundGangs[parseInt(String.fromCharCode(device.idx1))] = device;
            }
        });

        switch (response.endpoint) {
        case 16:
            var foundArray = [
                        foundGangs[0] != undefined, 
                        foundGangs[1] != undefined,
                        foundGangs[2] != undefined,
                        foundGangs[3] != undefined
                    ];
            var gangtype = Session.get('gang-type');
            var gang = [
                {name:"Header4Gang", modules: Template.ModalAddDevice.quadGang}, 
                {name:"Header2Gang", modules: Template.ModalAddDevice.dualGang}, 
                {name:"HeaderCurtain", modules:Template.ModalAddDevice.dualGang}, 
                {name:"HeaderCurtainSwitch", modules:Template.ModalAddDevice.CurtainSwitch}
            ];
            gangtype = parseInt(gangtype);
            Template.ModalAddDevice.modules = gang[gangtype].modules;
            Router.current().render(gang[gangtype].name, {to:"modalHeader", data: {founds:foundArray, added:[false, false, false, false]}});
            Router.current().render("Blank", {to:"modalBody"});
            if( gangtype == 0 ) {
                Router.current().render("Body4Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 1 ) {
                Router.current().render("Body2Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 2 ) {
                Router.current().render("BodyCurtain", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 3 ) {
                Router.current().render("BodyCurtainSwitch", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            break;
        case 18:
        }
    });

    var toutHandler = null;
    Notifier.addListener('sceneAction', function(message) {
        var m = JSON.parse(message);
        m.isNew = true
        Meteor.Notification.queue(m);
        if(toutHandler != null) {
            Meteor.clearTimeout(toutHandler);
        }
        toutHandler = Meteor.setTimeout(function() {
            Session.set('notification-count', Meteor.Notification.countNew());
            toutHandler = null;
        }, 1000);
    });
}
