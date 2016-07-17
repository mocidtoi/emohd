Template.More.onRendered(function(){
    var self = this;
    Meteor.setTimeout(function(){
        self.$(".rippler").rippler({
            effectClass      :  'rippler-effect'
            ,effectSize      :  16      // Default size (width & height)
            ,addElement      :  'div'   // e.g. 'svg'(feature)
            ,duration        :  400
        });
    }, 100);
});

Template.More.events({
    'click a[data-action]': function(event, instance) {
        var elem = event.currentTarget;
        var dataAction = elem.getAttribute('data-action');
        if(dataAction) {
            Meteor.setTimeout( function() {
                Session.set('dialog-name', dataAction);
                $('#modal-config').modal();
            }, 200);
        }
    },
    'click a#language': function(event, instance) {
        var lang = window.localStorage.getItem("__lang");
        if (lang == 'vn') lang = 'en';
        else lang = 'vn';
        window.localStorage.setItem("__lang", lang);
        Meteor.setTimeout(function() {
            window.location.reload();
        }, 10);
    },
    'click a[data-href]': function(event, instance) {
        var url = event.currentTarget.getAttribute('data-href');
        Meteor.setTimeout(function(){
            Router.go(url);
        }, 200);
    },
    'click a#clock-syn': function(event, instance) {
        Meteor.apply('syncClock', [Date.now()], {wait:false}, function(err, res) {
            console.log(res);
        });
    }
});
Template.More.helpers(PageHelpers);
Template.More.helpers({
    language: function() {
        var lang = window.localStorage.getItem("__lang");
        if (!lang) {
            lang = "vn";
            window.localStorage.setItem("__lang", lang);
        }
        return lang.toUpperCase();
    }
});
