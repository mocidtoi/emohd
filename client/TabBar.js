Template.TabBar.onRendered(function() {
    
});

Template.TabBar.helpers({
    active_1: function() {
        return (Session.get('active-tab') == 1)?"active":"";
    },
    active_2: function() {
        return (Session.get('active-tab') == 2)?"active":"";
    },
    active_3: function() {
        return (Session.get('active-tab') == 3)?"active":"";
    },
    active_4: function() {
        return (Session.get('active-tab') == 4)?"active":"";
    },
    active_5: function() {
        return (Session.get('active-tab') == 5)?"active":"";
    },
    hideBadge: function() {
        var nc = Session.get('notification-count');
        return ( nc && nc > 0 ) ? "": "hide";
    },
    notificationCount: function() {
        return Session.get('notification-count');
    }
});
/*
Template.TabBar.events({
    'click #tabbar > li > a': function(event) {
        Template.instance().$('#tabbar > li > a.active').removeClass("active");
        $(event.currentTarget).addClass("active");
    }
});*/
