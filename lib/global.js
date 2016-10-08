import { ReactiveVar } from 'meteor/reactive-var';
TIMEOUT_PERIOD=4000;
TICKS = 8;
TICK_PERIOD = TIMEOUT_PERIOD/TICKS;

Configs = null;
if(Meteor.isClient) {
    error_msg = new ReactiveVar("");
    Configs = new Mongo.Collection('configs');
}

dhcp = true;
ssid = "";
password = "";
ipaddress = "";
netmask = "";
gateway = "";

notifier=null;
adminNotifier = function() {
    notifier = new EventDDP('dhome-admin');
    notifier.addListener('login', function(message) {
        var msg = JSON.parse(message);
        if(msg.code == 0) {
            console.log("Success");
            Router.go("/admin/config");
        }
        else {
            error_msg.set(msg.reason);
        }
        Router._currentController.render("Blank", {to: "overlay"});
    });
}
