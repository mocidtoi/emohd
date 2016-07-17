Template.Scenes.onRendered(function() {
    Session.set('title', "Scenes");
});
Template.Scenes.helpers(PageHelpers);
Template.Scenes.helpers({
    scene: function() {
        return Scene.find({}).fetch();
    }
});
Template.Scenes.events({
    'click div.list-group-item[data-id]': function(event, instance) {
        var elem = event.currentTarget;
        Meteor.apply('sceneAction', [elem.getAttribute('data-id')], {wait:false});
        $(elem).removeClass('no-background', 1000);
        Meteor.setTimeout(function(){
            $(elem).addClass('no-background', 1000);
        }, 1000);
    },
    'click .list-group-item a': function(event) {
        event.stopPropagation();
    }
});
