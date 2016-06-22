import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import './main.html';

configNotifier();

Template.ApplicationLayout.helpers({
    title: function() {
        return Session.get("title");
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


Template.LoadingScreen.onRendered(function() {
    Template.LoadingScreen.oldTitle = Session.get('title');
});

Template.LoadingScreen.helpers({
    connStatus: function() {
        if (!Meteor.status().connected) {
            Session.set('status-message', 'Cannot connect to server');
            Session.set('title', 'Loading ...');
            return "";
        }
        Session.set('title', Template.LoadingScreen.oldTitle);
        return "hide";
    },
    message: function() {
        return Session.get('status-message');
    }
});
