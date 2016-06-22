Future = Npm.require('fibers/future');
var SerialPort;
//var serialPort;

Notifier = new EventDDP("emohd");
kodiIP = null, kodiUser = null, kodiPassword=null, netatmoURL=null, netatmoUser=null, netatmoPassword=null;

var byteDelimiter = function(emitter, buffer) {
    console.log('----------')
    console.log(buffer)
    console.log('RAW: ' + buffer);
    console.log('----------')
    for (var i = 0; i < buffer.length;) {
        if (buffer[i] == 0x44) {
            var bufseq = new Buffer(8);
            bufseq[0] = buffer[i];
            i++;
            for (var j = 1; j < 8; j++) {
                if (buffer[i] != 0x44)
                    bufseq[j] = buffer[i];
                else {
                    console.log('----------')
                    console.log('Bad Message: ' + bufseq);
                    console.log(bufseq)
                    console.log('----------')
                    break;
                }
                if (j == 7 || i >= buffer.length) {
                    emitter.emit('data', bufseq);
                    break;
                }
                else {
                    i++;
                }
            }
        }
        else {
            i++;
        }
    }
};

if (process.env.MOCKUP == 'yes') {
    SerialPort = Meteor.npmRequire("virtual-serialport");
    serialPort = new SerialPort("/dev/ttyO1", {
        baudrate: 115200
    });
    serialPort.on("dataToDevice", function(data) {
        if (data[0] == 0x44 && data[1] == 0x31) {
            if (data[2] == 0x34) {
                var res = new Buffer(8);
                res[0] = 0x44;
                res[1] = 0x33;
                res[2] = 0x34;
                res[3] = data[3];
                res[4] = data[4];
                res[5] = data[5];
                res[6] = data[6];
                res[7] = data[7];
                serialPort.writeToComputer(res);
            }
            if (data[2] == 0x32) {
                var res = new Buffer(8);
                res[0] = 0x44;
                res[1] = 0x33;
                res[2] = 0x33;
                res[3] = data[3];
                res[4] = parseInt(Math.random() * 1000) % 100
                res[5] = parseInt(Math.random() * 1000) % 100
                //res[4] = 0x29;
                //res[5] = 0x16;
                res[6] = 0x10;
                res[7] = data[7];
                serialPort.writeToComputer(res);
            }
        }
    });
}
else {
    SerialPort = Meteor.npmRequire("serialport");
    serialPort = new SerialPort.SerialPort("/dev/ttyO1", {
        baudrate: 115200,
        parser: byteDelimiter
    });
}

Meteor.onConnection(function(){
    console.log("A client connected");
});

serialPort.on("open", function() {
    console.log("Open /dev/ttyO1");
});

//var commandTrig, commandInfo;

serialPort.on('data', function(data) {
    if (data[0] == 0x44 && data[1] == 0x33) { //"D": start byte; "3": device -> ZAP)
        try {
            if (data[2] == 0x34) { // Command response (E.g.: report on/off)
                Device.findOne({
                    where: {
                        idx: data[3],
                        netadd: data[4] * 256 + data[5],
                        endpoint: data[6]
                    }
                }).then(function(dev){
                    if(dev) {
                        if(dev.sceneId && dev.type == Constants.DEVTYPE_SCENE) {
                            console.log("Scene button: " + dev.sceneId);
                            doScene(dev.sceneId);
                        }
                        else if( dev.type == Constants.DEVTYPE_CURTAIN) {
                            console.log("Curtain down");
                        }
                        else {
                            dev.status = data[7];
                            dev.save().then(function(thisDev){
                                console.log("change state success");
                                Favorite.findOne({
                                    where:{deviceId:thisDev.id}
                                }).then(function(fav) {
                                    fav.count = fav.count + 1;
                                    fav.save();
                                }).catch(function(e){
                                    console.log("Error " + e);
                                    Favorite.create({
                                        count:1, 
                                        deviceId:thisDev.id
                                    }).then(function(fav){
                                        console.log("Create new fav");
                                    });
                                });
                            }).catch(function(e){
                                console.log("Update device " + e);
                            });
                        }
                    }
                    else {
                        Device.findOne({
                            where: {
                                idx1: data[3],
                                netadd: data[4] * 256 + data[5],
                                endpoint: data[6]
                            }
                        }).then(function(dev){
                            if( dev.type == Constants.DEVTYPE_CURTAIN) {
                                console.log("Curtain up");
                            }
                        }).catch(function(err) {
                            console.log("Error-3 " + err);
                            console.log(err.stack);
                        });
                    }
                }).catch(function(err){
                    console.log("Error-2 " + err);
                    console.log(err.stack);
                });
                /*if (commandTrig){
                    commandTrig(data);
                }*/
            }
            if (data[2] == 0x33) {
                var addr = data[4] * 256 + data[5];
                var response = {
                    message:"JOIN-INFO-REQ",
                    netadd: addr.toString(16),
                    endpoint: data[6],
                    buttonId: data[3]
                };
                console.log("Response: " + JSON.stringify(response));
                Notifier.emit('joininfo', JSON.stringify(response));
            }
        }
        catch (err) {
            console.log("Error-1 " + err);
            console.log(err.stack);
        }
    }
    // serialPort.flush(function(){
    //     console.log("Flush Buffer");
    // })
})

var Sequelize = Meteor.npmRequire('sequelize-hierarchy')();
var sequelize = new Sequelize('database', null, null, {
    dialect: 'sqlite',
    storage: '/tmp/database.sqlite'
});
var Group = sequelize.define('group', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    }
}, {
    hooks: {
        beforeDestroy: function(grp, option) {
            return Device.destroy({
                where: {
                    groupId: grp.id
                },
                individualHooks: true
            }).then(function(row) {
                return Group.destroy({
                    where: {
                        parentId: grp.id
                    },
                    individualHooks: true
                });
            })
        }
    },
    freezeTableName: true,
    hierarchy: true
});
var Device = sequelize.define('device', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    status: Sequelize.INTEGER,
    available: Sequelize.BOOLEAN,
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    idx: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    idx1: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    netadd: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    endpoint: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    sceneId: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
}, {
    hooks: {
        beforeDestroy: function(dev) {
            Favorite.destroy({
                where:{
                    deviceId: dev.id
                }
            });
            SceneDev.destroy({
                where: {
                    devId: dev.id
                }
            });
        }
    },
    freezeTableName: true
});
Device.belongsTo(Group)
var Task = sequelize.define('task', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    action: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    time: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
}, {
    hooks: {
        afterCreate: function(tsk, option) {
            if (taskPool[tsk.id] != null) taskPool[tsk.id].clear()
            if (tsk.active) {
                var schedule = later.parse.text(tsk.time)
                taskPool[tsk.id] = later.setInterval(function() {
                    command({
                        id: tsk.deviceId,
                        act: tsk.action ? 'on' : 'off'
                    }, function(res) {
                        console.log(res)
                    })
                }, schedule);
            }
        },
        afterUpdate: function(tsk, option) {
            if (taskPool[tsk.id] != null) taskPool[tsk.id].clear()
            if (tsk.active) {
                var schedule = later.parse.text(tsk.time)
                taskPool[tsk.id] = later.setInterval(function() {
                    command({
                        id: tsk.deviceId,
                        act: tsk.action ? 'on' : 'off'
                    }, function(res) {
                        console.log(res)
                    })
                }, schedule);
            }
        },
        afterDestroy: function(tsk, option) {
            if (taskPool[tsk.id] != null) {
                taskPool[tsk.id].clear()
                taskPool[tsk.id] = undefined
            }
        }
    },
    freezeTableName: true
});
Task.belongsTo(Device);

var Scene = sequelize.define('scene', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    time: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
}, {
    hooks: {
        beforeDestroy: function(scene) {
            Device.destroy({
                where: {
                    sceneId: scene.id
                }
            });
            SceneDev.destroy({
                where:{
                    sceneId: scene.id
                }
            });
        }
    },
    freezeTableName: true
});

//Device.belongsTo(Scene);
/*
Group.hasMany(Scene);
*/
var SceneDev = sequelize.define('scenedev', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    action: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
}, {
    freezeTableName: true
});
Scene.belongsToMany(Device, {
    through: 'scenedev',
    foreignKey: 'sceneId'
});
Device.belongsToMany(Scene, {
    through: 'scenedev',
    foreignKey: 'devId'
});

var Favorite = sequelize.define( 'favorite', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    count: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true
});

Favorite.belongsTo(Device);

var Config = sequelize.define( 'config', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    value: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    freezeTableName: true
});

function getParam(name) {
    var value;
    var future = new Future();
    Config.findOne({where:{name: name}}).then(function(config) {
        value = config.value;
        future.return();
    }).catch(function(){
        value = null;
        future.return();
    });
    future.wait();
    return value;
}
function setParam(name, value, callback) {
    var retVal = false;
    var future = new Future();
    Config.findOne({where: {name: name}}).then(function(config){
        if (config) {
            config.value = value;
            config.save();
            retVal = true;
            future.return();
        }
        else {
            Config.create({name:name, value:value}).then(function(config){
                retVal = true;
                future.return();
            }).catch(function(){
                future.return();
            });
        }
    }).catch(function(config){
        future.return();
    });
    future.wait();
    return retVal;
}

var later = Meteor.npmRequire('later');
var taskPool = new Array();
var sched = later.parse.text('every 4 sddd');


// var t = later.setInterval(function(){
//     command({id: 1, act: 'on'}, function(res) {
//         console.log(res)
//         command({id: 1, act: 'off'},function(res) {
//             console.log(res)
//         })
//     })
// }, sched);

function loadKodiParams() {
    kodiIP = getParam('kodiIP');
    kodiUser = getParam('kodiUser');
    kodiPassword = getParam('kodiPassword');
    console.log("kodiIP:" + kodiIP);
    console.log("kodiUser:" + kodiUser);
    console.log("kodiPassword:" + kodiPassword);
}
function loadNetatmoParams() {
    netatmoURL = getParam('netatmoURL');
    netatmoUser = getParam('netatmoUser');
    netatmoURL = getParam('netatmoPassword');
}

Meteor.startup(function() {
    var future = new Future();
    sequelize.sync().then(function() {
        Task.findAll().then(function(tsk) {
            for (var i = 0; i < tsk.length; i++) {
                if (tsk[i].active) {
                    var schedule = later.parse.text(tsk[i].time)
                    taskPool[tsk[i].id] = later.setInterval(function() {
                        command({
                            id: tsk[i].deviceId,
                            act: tsk[i].action ? 'on' : 'off'
                        }, function(res) {
                            console.log(res)
                        });
                    }, schedule);
                }
            }
            future.return();
        }).catch(function(e) { 
            console.log("Select all tasks " + e); 
            future.return();
        });
    }).catch(function(e) {
        console.log("Database sync " + e);
        future.return();
    });
    future.wait();
    loadKodiParams();
    loadNetatmoParams();
});

function addGroup(arg, callback) {
    if (arg) {
        arg.parentId = isNaN(parseInt(arg.parentId)) || parseInt(arg.parentId) < 1 ? undefined : parseInt(arg.parentId);
        Group.create(arg).then(function(grp) {
            callback({
                success: true,
                group: grp.toJSON()
            });
        }).catch(function(err) {
            callback({
                success: false,
                message: err.name == 'SequelizeForeignKeyConstraintError' ? 'Không có Group cha nào phù hợp.' : err.toString()
            });
        });
    }
    else callback({
        success: false,
        message: 'Dữ liệu gửi lên không đúng định dạng'
    });
}

function removeGroup(arg, callback) {
    if (arg && (typeof arg == 'number' || typeof arg == 'string')) {
        Group.destroy({
            where: (typeof arg == 'number' && {
                id: arg
            }) || (typeof arg == 'string' && {
                name: {
                    $like: '%' + arg + '%'
                }
            }),
            individualHooks: true
        }).then(function(row) {
            if (row > 0) callback({
                success: true,
                message: 'Đã xóa ' + row + ' Group tương ứng và các Group con'
            });
            else callback({
                success: false,
                message: 'Không có Group nào tương ứng'
            })
        }).catch(function(err) {
            callback({
                success: false,
                message: err.toString()
            })
        });
    }
    else callback({
        success: false,
        message: 'Dữ liệu gửi lên không đúng định dạng'
    });
}

function updateGroup(arg, callback) {
    if (arg && arg.id) {
        Group.update(arg, {
            where: {
                id: arg.id
            },
            individualHooks: true
        }).then(function(grp) {
            if (grp[0] > 0) callback({
                success: true,
                group: grp[1][0].toJSON()
            });
            else callback({
                success: false,
                message: 'Không có group nào tương ứng'
            });
        }).catch(function(err) {
            callback({
                success: false,
                message: err.toString()
            });
        });
    }
    else callback({
        success: false,
        message: 'Dữ liệu gửi lên không đúng định dạng'
    });
}

function addDevice(arg, callback) {
    if (arg) {
        Device.findOne({
            where: {
                idx: arg.idx,
                netadd: arg.netadd,
                endpoint: arg.endpoint,
                groupId: isNaN(arg.groupId) || parseInt(arg.groupId) < 1 ? undefined : parseInt(arg.groupId)
            }
        }).then(function(dev) {
            console.log("device:");
            //console.dir(dev);
            if (dev) {
                callback({
                    success: false,
                    message: 'Device bị trùng, đã có sẵn trong Group cha.'
                });
            }
            else {
                arg.groupId = isNaN(arg.groupId) || parseInt(arg.groupId) < 1 ? undefined : parseInt(arg.groupId);
                this.create(arg).then(function(dev2) {
                    callback({
                        success: true,
                        device: dev2.toJSON()
                    });
                }).catch(function(err) {
                    callback({
                        success: false,
                        message: err.name == 'SequelizeForeignKeyConstraintError' ? 'Không có Group cha nào phù hợp.' : err.toString()
                    });
                });
            }
        });
    }
    else {
        callback({
            success: false,
            message: 'Dữ liệu gửi lên không đúng định dạng.'
        });
    }
}

function removeDevice(arg, callback) {
    if (arg && (typeof arg == 'number' || typeof arg == 'string')) {
        Device.destroy({
            where: (typeof arg == 'number' && {
                id: arg
            }) || (typeof arg == 'string' && {
                name: {
                    $like: '%' + arg + '%'
                }
            }),
            individualHooks: true
        }).then(function(row) {
            if (row > 0) callback({
                success: true,
                message: 'Đã xóa ' + row + ' thiết bị tương ứng'
            });
            else callback({
                success: false,
                message: 'Không có thiết bị nào tương ứng'
            });
        }).catch(function(err) {
            callback({
                success: false,
                message: err.toString()
            });
        });
    }
    else {
        callback({
            success: false,
            message: 'Dữ liệu gửi lên không đúng định dạng.'
        });
    }
}

function updateDevice(arg, callback) {
    if (arg && arg.id) {
        Device.update(arg, {
            where: {
                id: arg.id
            },
            individualHooks: true
        }).then(function(res) {
            console.dir(res);
            if (res[0] > 0) callback({
                success: true,
                group: res[1][0].toJSON()
            });
            else callback({
                success: false,
                message: 'Không tìm thấy thiết bị này.'
            });
        }).catch(function(err) {
            console.log(err);
            callback({
                success: false,
                message: err.toString()
            });
        });
    }
    else {
        callback({
            success: false,
            message: 'Dữ liệu gửi lên không đúng định dạng.'
        });
    }
}
Meteor.publish('data', function() {
    var self = this;

    function preOrder(tree, self) {
        var children = [];
        if (tree.children)
            for (var i = 0; i < tree.children.length; i++) {
                preOrder(tree.children[i], self);
                children.push(tree.children[i].id);
            }
        var value = tree.toJSON();
        value.children = children;
        self.added('group', value.id, value);
    }

    function findTree(tree, id) {
        if (tree.id == id) return tree;
        if (tree.children)
            for (var i = 0; i < tree.children.length; i++) {
                var temp = findTree(tree.children[i], id);
                if (temp.id == id) return temp;
            }
    }
    Group.findAll({
        hierarchy: true
    }).then(function(grpp) {
        for (var i = 0; i < grpp.length; i++) {
            preOrder(grpp[i], self)
        }
    });
    Device.findAll().then(function(dev) {
        for (var i = 0; i < dev.length; i++) {
            self.added('device', dev[i].id, dev[i].toJSON())
        }
    });
    Task.findAll().then(function(tsk) {
        for (var i = 0; i < tsk.length; i++) {
            self.added('task', tsk[i].id, tsk[i].toJSON())
        }
    });
    Favorite.findAll().then(function(fav) {
        for (var i = 0; i < fav.length; i++) {
            self.added('favorite', fav[i].id, fav[i].toJSON());
        }
    });
    Scene.findAll().then(function(scene) {
        for (var i = 0; i < scene.length; i++ ) {
            self.added('scene', scene[i].id, scene[i].toJSON());
        }
    });
    SceneDev.findAll().then(function(sceneDev) {
        for (var i = 0; i < sceneDev.length; i++ ) {
            self.added('scenedev', sceneDev[i].id, sceneDev[i].toJSON());
        }
    });
    Group.addHook('afterCreate', self._session.id, function(grp, option) {
        Group.findAll({
            hierarchy: true
        }).then(function(grpp) {
            var parentNode = findTree(grpp[0].toJSON(), grp.parentId)
            if (parentNode) {
                var child = []
                if (parentNode.children)
                    for (var i = 0; i < parentNode.children.length; i++) {
                        child.push(parentNode.children[i].id)
                    }
                self.changed('group', parentNode.id, {
                    children: child
                });
            }
        });
        var value = grp.toJSON();
        value.children = [];
        self.added('group', grp.id, value);
    });
    Group.addHook('afterUpdate', self._session.id, function(grp, option) {
        console.log(grp);
        if (grp._changed.parentId) {
            Group.findAll({
                hierarchy: true
            }).then(function(grpp) {
                var oldParentNode = findTree(grpp[0].toJSON(), grp._previousDataValues.parentId);
                var newParentNode = findTree(grpp[0].toJSON(), grp.parentId);
                console.log(oldParentNode);
                console.log(newParentNode);
                if (oldParentNode) {
                    var childtemp = []
                    if (oldParentNode.children)
                        for (var i = 0; i < oldParentNode.children.length; i++) {
                            childtemp.push(oldParentNode.children[i].id)
                        }
                    self.changed('group', oldParentNode.id, {
                        updatedAt: oldParentNode.updatedAt,
                        children: childtemp
                    });
                }
                if (newParentNode) {
                    var childtemp = [];
                    if (newParentNode.children)
                        for (var i = 0; i < newParentNode.children.length; i++) {
                            childtemp.push(newParentNode.children[i].id)
                        }
                    self.changed('group', newParentNode.id, {
                        updatedAt: newParentNode.updatedAt,
                        children: childtemp
                    });
                }
            });
        }
        self.changed('group', grp.id, grp.toJSON());
    });
    Group.addHook('afterDestroy', self._session.id, function(grp, option) {
        self.removed('group', grp.id)
    });
    Device.addHook('afterCreate', self._session.id, function(dev, option) {
        self.added('device', dev.id, dev.toJSON());
    });
    Device.addHook('afterUpdate', self._session.id, function(dev, option) {
        self.changed('device', dev.id, dev.toJSON());
        console.log('Device updated');
    });
    Device.addHook('beforeDestroy', self._session.id, function(dev, option){
        Favorite.destroy({
            where:{
                deviceId: dev.id
            }
        });
    });
    Device.addHook('afterDestroy', self._session.id, function(dev, option) {
        self.removed('device', dev.id);
    });
    Task.addHook('afterCreate', self._session.id, function(tsk, option) {
        self.added('task', tsk.id, tsk.toJSON());
    });
    Task.addHook('afterUpdate', self._session.id, function(tsk, option) {
        self.changed('task', tsk.id, tsk.toJSON());
    });
    Task.addHook('afterDestroy', self._session.id, function(tsk, option) {
        self.removed('task', tsk.id);
    });
    Favorite.addHook('afterCreate', self._session.id, function(fav, option) {
        self.added('favorite', fav.id, fav.toJSON());
    });
    Favorite.addHook('afterUpdate', self._session.id, function(fav, option){
        self.changed('favorite', fav.id, fav.toJSON()); 
    });
    Favorite.addHook('afterDestroy', self._session.id, function(fav, option){
        self.removed('favorite', fav.id);
    });
    Scene.addHook('afterCreate', self._session.id, function(scene, option){
        self.added('scene', scene.id, scene.toJSON());
    });
    Scene.addHook('afterUpdate', self._session.id, function(scene, option){
        self.changed('scene', scene.id, scene.toJSON());
    });
    Scene.addHook('afterDestroy', self._session.id, function(scene, option){
        self.removed('scene', scene.id);
    });
    SceneDev.addHook('afterCreate', self._session.id, function(sceneDev, option){
        console.log('scenedev added');
        self.added('scenedev', sceneDev.id, sceneDev.toJSON());
    });
    SceneDev.addHook('afterUpdate', self._session.id, function(sceneDev, option){
        self.changed('scenedev', sceneDev.id, sceneDev.toJSON());
    });
    SceneDev.addHook('afterDestroy', self._session.id, function(sceneDev, option){
        console.log('afterDestroy sceneDev ' + sceneDev.id);
        self.removed('scenedev', sceneDev.id);
    });
    self.onStop(function() {
        Task.removeHook('afterCreate', self._session.id);
        Task.removeHook('afterUpdate', self._session.id);
        Task.removeHook('afterDestroy', self._session.id);
        Device.removeHook('afterCreate', self._session.id);
        Device.removeHook('afterUpdate', self._session.id);
        Device.removeHook('beforeDestroy', self._session.id);
        Device.removeHook('afterDestroy', self._session.id);
        Group.removeHook('afterCreate', self._session.id);
        Group.removeHook('afterUpdate', self._session.id);
        Group.removeHook('afterDestroy', self._session.id);
        Favorite.removeHook('afterCreate', self._session.id);
        Favorite.removeHook('afterUpdate', self._session.id);
        Favorite.removeHook('afterDestroy', self._session.id);
        Scene.removeHook('afterCreate', self._session.id);
        Scene.removeHook('afterUpdate', self._session.id);
        Scene.removeHook('afterDestroy', self._session.id);
        SceneDev.removeHook('afterCreate', self._session.id);
        SceneDev.removeHook('afterUpdate', self._session.id);
        SceneDev.removeHook('afterDestroy', self._session.id);
    });
    self.ready();
});

function permitjoin(info, callback) {
    var res = sendPermitJoin(20);
    callback(res);
}

function command(input, callback) {
    Device.findOne({
        where: {
            id: input.id
        }
    }).then(function(dev) {
        if (dev) {
            var devCtrl = new Buffer(8);
            devCtrl[0] = 0x44;
            devCtrl[1] = 0x31;
            devCtrl[2] = 0x34;
            devCtrl[3] = dev.idx;
            devCtrl[4] = dev.netadd / 256;
            devCtrl[5] = dev.netadd % 256;
            devCtrl[6] = dev.endpoint;
            devCtrl[7] = input.act == 'on' ? 0x31 : input.act == 'off' ? 0x30 : input.act == 'status' ? 0x32 : 0x0;
            serialPort.write(devCtrl, function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
                console.log(devCtrl);
            });
        }
        else {
            callback({
                success: false,
                message: "Không có thiết bị nào tương ứng"
            });
        }
    });
}
/*
function command(input, callback) {
    Device.findOne({
        where: {
            id: input.id
        }
    }).then(function(dev) {
        if (dev) {
            var devCtrl = new Buffer(8);
            devCtrl[0] = 0x44;
            devCtrl[1] = 0x31;
            devCtrl[2] = 0x34;
            devCtrl[3] = dev.idx;
            devCtrl[4] = dev.netadd / 256;
            devCtrl[5] = dev.netadd % 256;
            devCtrl[6] = dev.endpoint;
            devCtrl[7] = input.act == 'on' ? 0x31 : input.act == 'off' ? 0x30 : input.act == 'status' ? 0x32 : 0x0;
            if (input.act == 'on' || input.act == 'off' || input.act == 'status') {
                commandInfo = {
                    input: input,
                    callback: callback
                };
                commandTrig = function(data) {
                    if (data[0] == 0x44 && data[1] == 0x33 && data[2] == 0x34) {
                        if (commandInfo.input.act == 'status') {
                            commandInfo.callback({
                                success: true,
                                status: data[7],
                                message: "Trạng thái thiết bị"
                            });
                        }
                        else {
                            commandInfo.callback({
                                success: true,
                                status: data[7],
                                message: "Chuyển trạng thái thiết bị thành công"
                            });
                        }
                        commandTrig = undefined;
                        commandInfo = undefined;
                    }
                };
                serialPort.write(devCtrl, function(err, results) {
                    console.log('err ' + err);
                    console.log('results ' + results);
                    console.log(devCtrl);
                });
            }
            else callback({
                success: false,
                message: "Sai cú pháp điều khiển"
            });
        }
        else {
            callback({
                success: false,
                message: "Không có thiết bị nào tương ứng"
            });
        }
    });
}
*/
// setInterval(function(){
//     Device.findAll().then(function(devs){
//         devs.forEach(function(dev) {
//             var future = new Future();
//             command({
//                 id: dev.id,
//                 act: 'status'
//             }, future);
//             var respon = future.wait();
//             if (respon.success == false && respon.message == "offline") {
//                 Device.update({
//                     available: false
//                 }, {
//                     where: {
//                         id: dev.id
//                     },
//                     individualHooks: true
//                 })
//             }
//         })
//     })
// }, 5000)
function doScene(sceneId) {
    if(sceneId == -1) { // Default scene
        Device.findAll({
            where: { 
                type: {
                    $in: [0,1,2,3]
                }
            }
        }).then(function(devices) {
            for( var i = 0; i < devices.length; i++ ) {
                command({
                    id:devices[i].id,
                    act: 'off'
                }, function(res) {
                    console.dir(res);
                });
            }
            emitSceneAction(-1);
        }).catch(function(err){
            console.log("Error: " + err.toString());
        });
        
        return {success:true};
    }
    else {
        SceneDev.findAll({
            where: {
                sceneId: sceneId
            }
        }).then(function(sds) {
            for( var i = 0; i < sds.length; i++ ) {
                command({
                    id:sds[i].devId,
                    act: sds[i].action?'on':'off'
                }, function(res) {
                    console.log(res);
                });
            }
            emitSceneAction(sceneId);
        }).catch(function(err){
            console.log("Error: " + err.toString());
        });
        return {success:true};
    }
    }
function emitSceneAction(sceneId) {
    var now = new Date();
    var sceneActionMessage = {
        type: Constants.DEVTYPE_SCENE,
        time: (now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()),
    };
    if(sceneId == -1) {
        sceneActionMessage.content = "Turn all OFF";
        console.log("Emit: " + JSON.stringify(sceneActionMessage));
        Notifier.emit('sceneAction', JSON.stringify(sceneActionMessage));
    }
    else {
        Scene.findOne({
            where: {
                id:sceneId
            }
        }).then(function(scene) {
            sceneActionMessage.content = "Scene '" + scene.name + "' activated";
            console.log("Emit: " + JSON.stringify(sceneActionMessage));
            Notifier.emit('sceneAction', JSON.stringify(sceneActionMessage));
        }).catch(function(){});
    }
}

function curtainUp(curtainId) {
    Device.findOne({
        where: {
            id: curtainId
        }
    }).then(function(dev) {
        if (dev) {
            var devCtrl = new Buffer(8);
            devCtrl[0] = 0x44;
            devCtrl[1] = 0x31;
            devCtrl[2] = 0x34;
            devCtrl[3] = dev.idx1; // Button 1 --> Up curtain
            devCtrl[4] = dev.netadd / 256;
            devCtrl[5] = dev.netadd % 256;
            devCtrl[6] = dev.endpoint;
            //devCtrl[7] = input.act == 'on' ? 0x31 : input.act == 'off' ? 0x30 : input.act == 'status' ? 0x32 : 0x0;
            devCtrl[7] = 0x31; // "1" --> action "on"
            console.log('Write curtain up command');
            serialPort.write(devCtrl, function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
                console.log(devCtrl);
            });
        }
        else {
            console.log({
                success: false,
                message: "Không có thiết bị nào tương ứng"
            });
        }
    }).catch(function(err) {
        console.log(err.stack);
    });
}
function curtainDown(curtainId) {
    Device.findOne({
        where: {
            id: curtainId
        }
    }).then(function(dev) {
        if (dev) {
            var devCtrl = new Buffer(8);
            devCtrl[0] = 0x44;
            devCtrl[1] = 0x31;
            devCtrl[2] = 0x34;
            devCtrl[3] = dev.idx; // Button 0 --> Up curtain
            devCtrl[4] = dev.netadd / 256;
            devCtrl[5] = dev.netadd % 256;
            devCtrl[6] = dev.endpoint;
            //devCtrl[7] = input.act == 'on' ? 0x31 : input.act == 'off' ? 0x30 : input.act == 'status' ? 0x32 : 0x0;
            devCtrl[7] = 0x31; // "1" --> action "on"
            console.log('Write curtain down command');
            serialPort.write(devCtrl, function(err, results) {
                console.log('err ' + err);
                console.log('results ' + results);
                console.log(devCtrl);
            });
        }
        else {
            console.log({
                success: false,
                message: "Không có thiết bị nào tương ứng"
            });
        }
    }).catch(function(err) {
        console.log(err.stack);
    });
}
Meteor.methods({
    com: function(input) {
        //var future = new Future();
        command(input, function(res) {
            console.log(res);
        //    future.return(res);
        });
        //return future.wait();
    },
    com2: function(input) {
        Device.findOne({
            where: {
                id: input.id
            }
        }).then(function(dev) {
            if (dev) {
                var devCtrl = new Buffer(8);
                devCtrl[0] = 0x44;
                devCtrl[1] = 0x31;
                devCtrl[2] = 0x34;
                devCtrl[3] = dev.idx;
                devCtrl[4] = dev.netadd / 256;
                devCtrl[5] = dev.netadd % 256;
                devCtrl[6] = dev.endpoint;
                devCtrl[7] = input.act == 'on' ? 0x31 : input.act == 'off' ? 0x30 : input.act == 'status' ? 0x32 : 0x0;
                if (input.act == 'on' || input.act == 'off' || input.act == 'status') {
                    serialPort.write(devCtrl, function(err, results) {
                        console.log(devCtrl);
                        console.log('err ' + err);
                        console.log('results ' + results);
                    });
                }
            }
        });
        return true;
    },
    permit: function(info) {
        var future = new Future();
        permitjoin(info, function(res) {
            console.log("permit:" + res);
            future.return(res);
        });

        return future.wait();
    },
    stopPermit: function() {
        var messper = new Buffer(8);
        messper[0] = 0x44;
        messper[1] = 0x31;
        messper[2] = 0x32;
        messper[3] = 0x00;
        serialPort.write(messper);
    },
    addDevice: function(arg) {
        var future = new Future();
        console.log('addDevice: arg');
        //console.dir(arg);
        addDevice(arg, function(res) {
            future.return(res);
        });
        return future.wait();
    },
    updateDevice: function(arg) {
        var future = new Future();
        updateDevice(arg, function(res) {
            future.return(res);
        });
        return future.wait();
    },
    removeDevice: function(arg) {
        var future = new Future();
        removeDevice(arg, function(res) {
            future.return(res);
        })
        return future.wait();
    },
    addGroup: function(arg) {
        var future = new Future();
        addGroup(arg, function(res) {
            future.return(res);
        })
        return future.wait();
    },
    updateGroup: function(arg) {
        var future = new Future();
        updateGroup(arg, function(res) {
            future.return(res);
        })
        return future.wait();
    },
    removeGroup: function(arg) {
        var future = new Future();
        removeGroup(arg, function(res) {
            future.return(res);
        })
        return future.wait();
    },
    addTask: function(arg) {
        var future = new Future();
        if (arg) {
            arg.active = true;
            Task.create(arg).then(function(tsk) {
                future.return({
                    success: true,
                    group: tsk.toJSON()
                });
            }).catch(function(err) {
                future.return({
                    success: false,
                    message: err.name == 'SequelizeForeignKeyConstraintError' ? 'Không có Device nào phù hợp.' : err.toString()
                });
            });
        }
        else {
            future.return({
                success: false,
                message: 'Dữ liệu gửi lên không đúng định dạng'
            });
        }
        return future.wait();
    },
    updateTask: function(arg) {
        var future = new Future();
        if (arg) {
            Task.findById(arg.id).then(function(tsk) {
                if (tsk)
                    tsk.update(arg).then(function(res) {
                        future.return(res)
                    });
            });
        }
        else {
            future.return({
                success: false,
                message: 'Dữ liệu gửi lên không đúng định dạng'
            });
        }
        return future.wait();
    },
    removeTask: function(arg) {
        var future = new Future();
        if (arg) {
            Task.findById(arg).then(function(tsk) {
                if (tsk)
                    tsk.destroy();
            });
        }
        else {
            future.return({
                success: false,
                message: 'Dữ liệu gửi lên không đúng định dạng'
            });
        }
        return future.wait();
    },
    addScene: function(arg) {
        var future = new Future();
        if(arg) {
            arg.active = true;
            Scene.create(arg).then(function(scene) {
                future.return({
                    success: true
                });
            }).catch(function(err) {
                future.return({
                    success: false,
                    message: err.toString()
                });
            });
        }
        return future.wait();
    },
    removeScene: function(arg) {
        var future = new Future();
        if(arg) {
            Scene.destroy({
                where: {
                    id: parseInt(arg)
                },
                individualHooks: true
            }).then(function(){
                future.return({success: true});
            }).catch(function(err){
                future.return({
                    success: false,
                    message: err.toString()
                });
            });
        }
        return future.wait();
    },
    sceneAction: function(arg) {
        if(!isNaN(arg)) {
            doScene(parseInt(arg));
        }
        else {
            console.log('failure ' + arg);
            return {success:false, message: "Invalid argument (" + arg + ")"};
        }
    },
    addSceneDev: function(arg) {
        var future = new Future();
        console.log("---- " + arg);
        if(!isNaN(arg)) {
            console.log("---- Create ----");
            SceneDev.create({
                sceneId: parseInt(arg),
//                devId: parseInt(Math.random() * 1000),
                action: true
            }).then(function() {
                console.log('Success');
                future.return({
                    success: true
                }); 
            }).catch(function(err){
                console.log(err.toString());
                future.return({
                    success: false,
                    message: err.toString()
                });
            });
        }
        return future.wait();
    },
    updateSceneDev: function(arg) {
        var future = new Future();
        console.log("-- updateSceneDev " + arg);
        console.dir(arg);
        if(arg) {
            SceneDev.update(arg, {
                where:{
                    id: parseInt(arg.id)
                }
            }).then(function() {
                future.return({success:true});
            }).catch(function(err) {
                future.return({success:false, message: err.toString()});
            });
        }
        else {
            future.return({success:false, message:"Invalid data"});
        }
        return future.wait();
    },
    removeSceneDev: function(arg) {
        var future = new Future();
        if(arg) {
            SceneDev.destroy({
                where: {id: parseInt(arg)},
                individualHooks: true
            }).then(function(){
                console.log("Done then");
                future.return({success:true});
            }).catch(function(err){
                console.log("Done error")
                future.return({success:false, message: err.toString()});
            });
        }
        else {
            future.return({success:false, message:"Invalid data input"});
        }
        return future.wait();
    },
    configKodi: function(arg) {
        if(arg) {
            if( !setParam('kodiIP', arg.kodiIP) ) 
                return {success:false, message: "Cannot set kodiIP"};
            if( !setParam('kodiUser', arg.kodiUser) ) 
                return {success:false, message: "Cannot set kodiUser"};
            if( !setParam('kodiPassword', arg.kodiPassword) ) 
                return {success:false, message: "Cannot set kodiPassword"};
            loadKodiParams();
            return {success:true};
        }
        else {
            return {success:false, message:"Invalid data input"};
        }
    },
    configNetatmo: function(arg) {
        console.log("configNetatmo");
        console.dir(arg)
        if(arg) {
            if( !setParam('netatmoURL', arg.netatmoURL) ) 
                return {success:false, message: "Cannot set netatmoURL"};
            if( !setParam('netatmoUser', arg.netatmoUser) ) 
                return {success:false, message: "Cannot set netatmoUser"};
            if( !setParam('netatmoPassword', arg.netatmoPassword) ) 
                return {success:false, message: "Cannot set netatmoPassword"};
            loadNetatmoParams();
            return {success:true};
        }
        else {
            return {success:false, message:"Invalid data input"};
        }
    },
    curtainUp: curtainUp,
    curtainDown: curtainDown,
    curtainStop: function(arg) {
        curtainUp(arg);
        curtainDown(arg);
    }
});
