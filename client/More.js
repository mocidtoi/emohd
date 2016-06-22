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
        console.log('Ok');
        var dataAction = elem.getAttribute('data-action');
        if(dataAction) {
            Meteor.setTimeout( function() {
                Session.set('dialog-name', dataAction);
                $('#modal-config').modal();
            }, 200);
        }
    },
    'click a[data-href]': function(event, instance) {
        var url = event.currentTarget.getAttribute('data-href');
        Meteor.setTimeout(function(){
            Router.go(url);
        }, 200);
    }
});
