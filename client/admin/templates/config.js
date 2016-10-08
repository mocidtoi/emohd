Template.config.events({
    'click #dhcp': function(event) {
        console.log(event.target.checked);
        if(event.target.checked) {
            Template.instance().$('#ipSetting').hide(500);
        }
        else {
            Template.instance().$('#ipSetting').show(500);
        }
    },
    'click #ok': function() {
        console.log('Clicked on OK');
        var instance = Template.instance();
        dhcp = instance.$('#dhcp').prop('checked');
        ssid = instance.$('#inputSSID').val();
        password = instance.$('#inputPassword').val();
        ipaddress = instance.$('#inputIP').val();
        netmask = instance.$('#inputMask').val();
        gateway = instance.$('#inputGW').val();
        console.log('config ' + ssid + password + dhcp + ipaddress + netmask);
        Meteor.call('config', ssid, password, dhcp, ipaddress, netmask, gateway);
        Router.go('/');
    },
    'change #profile': function(event, instance) {
        var idx = event.currentTarget.selectedIndex;
        var optionValue = parseInt(event.currentTarget.options[idx].value);
        if(optionValue < 0) {
            instance.$('#dhcp').attr("checked", false);
            instance.$('#inputSSID').val("");
            instance.$('#inputPassword').val("");
            instance.$('#inputIP').val("");
            instance.$('#inputMask').val("");
            instance.$('#inputGW').val("");
            instance.$('#ipSetting').show();
        }
        else {
            var selector = {id:optionValue};
            var obj = Configs.find(selector).fetch()[0];//forEach(function(obj) {
                instance.$('#dhcp').attr("checked", false);
                instance.$('#inputSSID').val(obj.ssid);
                instance.$('#inputPassword').val(obj.password);
                instance.$('#inputIP').val(obj.ipaddress);
                instance.$('#inputMask').val(obj.netmask);
                instance.$('#inputGW').val(obj.gateway);
                instance.$('#ipSetting').show(500);
            //});
        }
    }
});
Template.config.helpers({
    configs: function() {
        return Configs.find().fetch();
    }
});
/*Template.config.onRendered(function() {
    this.$('#dhcp').prop('checked', true);
    this.$('#ipSetting').hide();
});*/
