import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import './main.html';

Meteor.startup(function(){
    var language = window.localStorage.getItem("__lang");
    if(!language) {
        language = 'vn';
        window.localStorage.setItem("__lang", language);
    }
    TAPi18n.setLanguage(language).done(function() {
        console.log('Set language ' + language);
    }).fail(function() {
        console.log('Failed to set language ' + language);
    });

    if (Meteor.isCordova) {
        document.addEventListener("backbutton", function () {
            console.log("Back button pressed");
        });
    }

    Meteor.apply('syncClock', [Date.now()], {wait:false}, function(err, res) {
        console.log(err);
        console.log(res);
    });
});

configNotifier();

Template.ApplicationLayout.helpers({
    title: function() {
        return Session.get("title");
    },
    has_widget: function() {
        return Session.get("has-widget");
    }
});
Template.ApplicationLayout.events({
    'scroll #scrollable': function(event) {
        event.stopPropagation();
        var self = Template.instance();
        var st = $(event.currentTarget).scrollTop();
        if (Math.abs(self.lastScrollTop - st) <= self.delta) {
            return;
        }
        if(st > self.lastScrollTop) {
            // Scroll Down
            self.$('.navbar').removeClass('nav-down').addClass('nav-up');
            self.$('.widget-content').removeClass('widget-down').addClass('widget-up');
            self.$('.play-control').removeClass('play-down').addClass('play-up');
            self.$('.tabbar-container').removeClass('tabbar-down').addClass('tabbar-up');
        } else {
            // Scroll Up
            self.$('.navbar').removeClass('nav-up').addClass('nav-down');
            self.$('.widget-content').removeClass('widget-up').addClass('widget-down');
            self.$('.play-control').removeClass('play-up').addClass('play-down');
            self.$('.tabbar-container').removeClass('tabbar-up').addClass('tabbar-down');
        }
        self.lastScrollTop = st;
    }
});
Template.ApplicationLayout.onRendered(function() {
    var self = this;
    self.lastScrollTop = 0;
});

Template.SaveBtn.helpers({
    hide: function() {
        return (Session.get('show-save-btn'))?"":"hide";
    },
    back: function() {
        return "";
        //return getBackLink();
    }
});

Template.SaveBtn.events({
    'click button': function(event) {
        event.stopPropagation();
        console.log('SaveBtn clicked');
        if (CALLBACKS.saveBtn) {
            CALLBACKS.saveBtn();
            console.log('Do save');
            Session.set('show-save-btn', false);
        }
        else {
            console.log('Don\'t have save callback');
        }
    }
});

Template.SaveBtn.onDestroyed(function() {
    Session.set('show-save-btn', false);
    CALLBACKS.saveBtn = null;
});

Template.SettingsBtn.events({
    'click button[data-action]': function(event, instance) {
        var dialogName = event.currentTarget.getAttribute('data-action');
        Session.set('dialog-name', dialogName);
        $('#modal-config').modal();
    }
});

Template.CancelBtn.helpers({
    back: function() {
        var backlink = Session.get('cancel-btn-back');
        return backlink == undefined ? "#" : backlink;
    }
});

Template.AddBtn.helpers({
    modal: function(){
        var md =Session.get('modal-top');
        return md?md:"";
    }
});


Template.LoadingScreen1.onRendered(function() {
    Session.set('loading-screen1', true);
});

Template.LoadingScreen1.onDestroyed(function() {
    Session.set('loading-screen1', false);
});

var loadingEventHandlers = {
    'click #reconnect': function(event, instance) {
        if(Meteor.isCordova) {
            zeroconf_discover(function(error, res) {
                if(!error) {
                    reconfigServer('http://' + res.ip + ":" + res.port + "/");
                }
            });
        }
    },
    'click #scan': function(event, instance) {
        if(Meteor.isCordova) {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if(result && result.text) {
                        var configJSON = JSON.parse(result.text);
                        if(configJSON.root_url && configJSON.token) {
                            zeroconf_discover(function(error, res) {
                                if(!error) {
                                    reconfigServer('http://' + res.ip + ":" + res.port + "/", configJSON.token);
                                }
                            });
                        }
                        else {
                            alert("We got a barcode but incorrect format\n" +
                                "Result: " + result.text + "\n" +
                                "Format: " + result.format + "\n" +
                                "Cancelled: " + result.cancelled);
                        }
                    }
                    else {
                        alert("Error: barcode infor is null/undefined");
                    }
                }, 
                function (error) {
                    alert("Scanning failed: " + error);
                }
            );
        }
    },
    'click #wificonfig': function() {
        Router.go('/admin/config');
    }
};

Template.LoadingScreen.events(loadingEventHandlers);
Template.LoadingScreen1.events(loadingEventHandlers);

Template.LoadingScreen.helpers({
    hide: function() {
        return (Session.get('loading-screen1'))?"hide":"";
    },
    connStatus: function() {
        if (!Meteor.status().connected) {
            Session.set('status-message', 'Connecting to DHome');
            return "";
        }
        return "hide";
    },
    message: function() {
        return TAPi18n.__(Session.get('status-message'));
    },
    isCordova: function() {
        return Meteor.isCordova;
    }
});

Template.LoadingScreen1.helpers({
    isCordova: function() {
        return Meteor.isCordova;
    },
    message: function() {
        return TAPi18n.__(Session.get('status-message'));
    }
});
