var fs = Npm.require('fs');
var CONFIG = JSON.parse(fs.readFileSync('/etc/dhome/dhome-admin.cfg'));

var Future = Npm.require('fibers/future');

var Sequelize = Meteor.npmRequire('sequelize-hierarchy')();

var sequelize = new Sequelize('netconfig', null, null, {
    dialect: 'sqlite',
    storage: CONFIG.db_location
});

var spawn = Npm.require('child_process').spawn;

Meteor.startup(() => {
    // code to run on server at startup
    var future = new Future();
  // code to run on server at startup
    console.log('db file:' + CONFIG.db_location);
    console.log('wifi_config:' + CONFIG.wifi_config);
    console.log('onReady:' + CONFIG.onReady);
    try {
        sequelize.sync().then(function() {
            console.log("\t-->Done");

/*
            var onReadyProcess = spawn(CONFIG.onReady);
            onReadyProcess.on('error', function(err){
                console.log('onReady:Error:' + err);
            });
            onReadyProcess.stdout.on('data', function(data) {
                console.log('onReady:output:' + data);
            });
*/
            future.return();
        });
        console.log("load database:");
        future.wait();
    }
    catch(err) {
        var onReadyProcess = spawn(CONFIG.onError);
        onReadyProcess.on('error', function(err) {
            console.log('onReady:Error:' + err);
        });
        onReadyProcess.stdout.on('data', function(data) {
            console.log('onReady:output:' + data);
        });
    }
});

Meteor.methods({
    signin: function (user, passwd) {
        var future = new Future();
        check(user, String);
        check(passwd, String);
        if( username == user && password == passwd) {
            return {code:0};
        }
        else {
            return {code:-1,reason:"invalid username or password"};
        }
    },
    config: function(ssid, password, dhcp, ipaddr, netmask, gateway) {
        check(ssid, String);
        check(password, String);
        check(dhcp, Boolean);
        var configProcess;
        if( dhcp ) {
            console.log(CONFIG.wifi_config + " " + ssid + " " + password);
            configProcess=spawn(CONFIG.wifi_config, [ssid, password] );
        } 
        else {
            check(ipaddr, String);
            check(netmask, String);
            check(gateway, String);
            console.log(CONFIG.wifi_config + " " + ssid + " " + password + " " + ipaddr + " " + netmask);
            configProcess=spawn(CONFIG.wifi_config, [ssid, password, ipaddr, netmask, gateway]);
        }
        configProcess.on('error', function(err){
            console.log('Error:' + err);
        });
        configProcess.stdout.on('data', function(data) {
            console.log('output:' + data);
        });
        configProcess.on('close', function(code){
            console.log("Config done, return code: " + code);
        });
    }
});

Meteor.publish('netconfigs', function() {
    var self = this;
    moNetworkConfig.findAll().then(function(configs) {
        for( var i = 0; i < configs.length; i++ ) {
            self.added('configs', configs[i].id, configs[i].toJSON());
        }
    });
    self.ready();
    console.log("Admin Publish ready");
});

moNetworkConfig = sequelize.define('netconfig', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ssid: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    ipaddress: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    netmask: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    gateway: {
        type: Sequelize.TEXT, 
        allowNull: false
    }
}, {
    freezeTableName: true
});

