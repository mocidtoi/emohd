Template.signin.onCreated(function() {
    error_msg.set("");
});
Template.signin.helpers({
    adminConnected: function() {
        return (AdminConnection && (AdminConnection.status().connected))?"":"hide";
    },
    adminNotConnected: function() {
        return (AdminConnection && (AdminConnection.status().connected))?"hide":"";
    },
    errorMsg: function() {
        return error_msg.get();
    }
});
Template.signin.events({
    'click #Signin': function() {
        var uname = Template.instance().$('#inputUsername').val();
        var passwd = Template.instance().$('#inputPassword').val();
        Meteor.setTimeout(function() {
            AdminConnection.call('signin', uname, passwd, function(error, result) {
                if(result.code >=0) {
                    Router.go('/admin/config');
                }
                else {
                    error_msg.set('Invalid username or password');
                }
            });
        }, 200);
    }
});

