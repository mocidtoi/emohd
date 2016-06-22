Template.ModalConfirm.onRendered(function(){
    console.log("Modal confirm rendered");
});
Template.ModalConfirm.helpers({
    title: function() {
        return Session.get('confirm-title');
    },
    content: function() {
        return Session.get('confirm-content');
    }
});

Template.ModalConfirm.events({
    'hidden.bs.modal #confirm': function() {
        Template.ModalConfirm.cbFunc = undefined;
    },
    'click #ok': function(event, instance) {
        Template.ModalConfirm.cbFunc();
    },
    'click #cancel': function(event, instance) {
        console.log("Cancel clicked");
    }
});
