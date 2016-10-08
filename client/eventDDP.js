console.log('eventDDP');

configNotifier = function() {
    console.log("Config Notifier");
    Notifier.addListener('joininfo', function(message) {
        console.log("joininfo");
        var response = JSON.parse(message);
        console.log(response);
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
        case 17:
            var foundArray = [
                        foundGangs[0] != undefined, 
                        foundGangs[1] != undefined,
                        foundGangs[2] != undefined,
                        foundGangs[3] != undefined
                    ];
            var gangtype = Session.get('gang-type');
            var gang = [
                {name:"Header4Gang", modules: Template.ModalAddDevice.dualLightDualScene}, 
                {name:"Header4Gang", modules: Template.ModalAddDevice.tripleLightSingleScene}, 
                {name:"Header4Gang", modules: Template.ModalAddDevice.quadScene}, 
                {name:"Header2Gang", modules: Template.ModalAddDevice.dualLight}, 
                {name:"Header2Gang", modules: Template.ModalAddDevice.dualScene}, 
                {name:"Header1Gang", modules:Template.ModalAddDevice.singleLight}, 
                {name:"Header1Gang", modules:Template.ModalAddDevice.singleScene}, 
                {name:"HeaderCurtain", modules:Template.ModalAddDevice.curtain2},
                {name:"Header2Gang", modules:Template.ModalAddDevice.singleLightSingleScene}
            ];
            gangtype = parseInt(gangtype);
            console.log(gangtype);
            console.log(gang);
            Template.ModalAddDevice.modules = gang[gangtype].modules;
            Router.current().render(gang[gangtype].name, {to:"modalHeader", data: {founds:foundArray, added:[false, false, false, false]}});
            Router.current().render("Blank", {to:"modalBody"});
            if( gangtype == 0 ) { // 2-light, 2-scene
                Router.current().render("Body4Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 1 ) { // 3-light, 1-scene
                Router.current().render("Body4Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 2 ) { // 4-scene switch
                Router.current().render("Body4Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 3 ) { // 2-light
                Router.current().render("Body2Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 4 ) { // 2-scene
                Router.current().render("Body2Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 5 ) { // 1-light
                Router.current().render("Body1Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 6 ) { // 1-scene
                Router.current().render("Body1Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 7 ) { // gang for curtain
                Router.current().render("BodyCurtain", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            else if( gangtype == 8 ) { // 1-light, 1-scene
                Router.current().render("Body2Gang", {to: "modalBody", data: {foundGangs: foundGangs}});
            }
            break;
            
        case 18:
            break;
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
