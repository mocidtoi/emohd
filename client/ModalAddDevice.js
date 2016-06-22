Template.ModalAddDevice.quadGang = [
        {index: 0, region:"switch-1", active:"active", in:"in", pos:"col-xs-6 pos-lt", template:"FragmentAdd"},
        {index: 1, region:"switch-2", active:"", in:"", pos:"col-xs-6 pos-rt", template:"FragmentAdd"},
        {index: 2, region:"switch-3", active:"", in:"", pos:"col-xs-6 pos-lb", template:"FragmentAdd"},
        {index: 3, region:"switch-4", active:"", in:"", pos:"col-xs-6 pos-rb", template:"FragmentAddScene"}
];

Template.ModalAddDevice.dualGang = [
        {index: 0, region:"switch-1", active:"active", in:"in", pos:"col-xs-6 pos-lt", template:"FragmentAdd"},
        {index: 1, region:"switch-2", active:"", in:"", pos:"col-xs-6 pos-rt", template:"FragmentAddScene"}
];
Template.ModalAddDevice.Curtain = [
        {index: 0, region:"curtain", active:"active", in:"in", pos:"pos-lt"},
];

Template.ModalAddDevice.CurtainSwitch = [
        {index: 0, region:"curtain", active:"active", in:"in", pos:"pos-lt"},
        {index: 2, region:"switch-3", active:"", in:"", pos:"col-xs-6 pos-lb"},
        {index: 3, region:"switch-4", active:"", in:"", pos:"col-xs-6 pos-rb"}
];

Template.ModalAddDevice.renderDoneCallback = null;

function onDeviceAdded(templtInstance, idx) {
    // Modal header add check symbol
    console.log("onDeviceAdded " + idx);
    console.dir(templtInstance.$('.nav-pills a[data-toggle="pill"]'));
    console.dir(templtInstance.$('.tab-pane button.addBtn'));
    templtInstance.$('.nav-pills a[data-toggle="pill"]').eq(idx).append("<i style='margin-left: 0.5em;' class='rounded xsmall glyphicon glyphicon-ok bg-success'></i>");
    // disable button in modal content
    templtInstance.$('.tab-pane button.addBtn').eq(idx).prop('disabled', true);
}

Template.ModalAddDevice.modalBodyEvents = {
    'shown.bs.tab .nav-pills a': function(event, instance) {
        var elem = event.currentTarget;
        var i = elem.getAttribute('data-index');
        i = parseInt(i);
        console.dir(instance.data.founds[i]);
        if(instance.data && instance.data.founds[i] && (!(instance.data.added[i])))
        {
            instance.data.added[i] = true;
            instance.$('.nav-pills a[href="#gang' + i + '"]').append("<i style='margin-left: 0.5em;' class='rounded xsmall glyphicon glyphicon-ok bg-success'></i>");
        }
    }
};

function addCurtain(buttonIdx, idx, instance) {
    var gangname = instance.$('input.gangname').eq(idx).val();
    if( gangname && gangname !== "" ) {
        Meteor.apply("addDevice", [{
                name: gangname,
                descrip:"Description curtain",
                type: Constants.DEVTYPE_CURTAIN, // curtain
                idx: "0".charCodeAt(0),
                idx1: "1".charCodeAt(0),
                netadd: parseInt(Session.get("netaddr"), 16),
                endpoint: parseInt(Session.get("endpoint")),
                groupId: parseInt(Session.get('room-id'))
            }],{wait:false}, 
            function(err, res){
                if(err) {
                    console.log(err);
                }
                else {
                    onDeviceAdded(instance, idx);
                    var jqTabs = instance.$('.nav-pills a[data-toggle="pill"]');
                    jqTabs.eq((idx+1) % jqTabs.length).tab('show');
                }
            }
        );
    }
    else {
        instance.$('input.gangname').eq(idx).parent().addClass('has-error');
        setTimeout(function() {
            instance.$('input.gangname').eq(idx).parent().removeClass('has-error');
        }, 2000);
    }
}
function addSceneButton(buttonIdx, idx, sceneId, sceneName, instance) {
    var gangname = sceneName;
    if( gangname && gangname !== "" ) {
        Meteor.apply("addDevice", [{
                name: gangname,
                descrip:"Description scene",
                type: Constants.DEVTYPE_SCENE, // scene button
                idx: "0".charCodeAt(0) + buttonIdx,
                sceneId: sceneId,
                netadd: parseInt(Session.get("netaddr"), 16),
                endpoint: parseInt(Session.get("endpoint")),
                groupId: parseInt(Session.get('room-id'))
            }],{wait:false}, 
            function(err, res){
                if(err) {
                    console.log(err);
                }
                else {
                    onDeviceAdded(instance, idx);
                    var jqTabs = instance.$('.nav-pills a[data-toggle="pill"]');
                    jqTabs.eq((idx+1) % jqTabs.length).tab('show');
                }
            }
        );
    }
    else {
        instance.$('input.sceneName').eq(idx).parent().addClass('has-error');
        setTimeout(function() {
            instance.$('input.sceneName').eq(idx).parent().removeClass('has-error');
        }, 2000);
    }
}
function addButton(buttonIdx, idx, devType, instance) {
    var gangname = instance.$('form#form-' + idx + ' input.gangname').val();
    if( devType > -1 && gangname && gangname !== "" ) {
        Meteor.apply("addDevice", [{
                name: gangname,
                descrip: "Description",
                type: devType,
                idx: "0".charCodeAt(0) + buttonIdx,
                netadd: parseInt(Session.get("netaddr"), 16), //data[4] * 256 + data[5],
                endpoint: parseInt(Session.get("endpoint")),
                groupId: parseInt(Session.get('room-id'))
            }], {wait:false}, function(err, res){
                if(err) {
                    console.log(err);
                    console.dir(err);
                }
                else {
                    onDeviceAdded(instance, idx);
                    var jqTabs = instance.$('.nav-pills a[data-toggle="pill"]');
                    jqTabs.eq((idx+1) % jqTabs.length).tab('show');
                }
            }
        );
    }
    else {
        instance.$('input.gangname').eq(idx).parent().addClass('has-error');
        instance.$('input.mbsc-control').eq(idx).parent().addClass('has-error');
        setTimeout(function() {
            instance.$('input.gangname').eq(idx).parent().removeClass('has-error');
            instance.$('input.mbsc-control').eq(idx).parent().removeClass('has-error');
        }, 2000);
    }
}
Template.ModalAddDevice.events({
    "click button#configure": function(event, instance) {
        if(Session.get('gang-type') && parseInt(Session.get('gang-type')) > -1) {
            Meteor.apply('permit', [{
                    name1: instance.$("#gang1 .gangname").val(),
                    name2: instance.$("#gang2 .gangname").val(),
                    name3: instance.$("#gang3 .gangname").val(),
                    groupId: Session.get("room-id")
                }], {wait: false}, function(error, result) {
                console.log(error);
                console.log(result);
            });
        }
        else {
            instance.$('input.mbsc-control').parent().addClass('has-error');
            setTimeout(function() {
                instance.$('input.mbsc-control').parent().removeClass('has-error');
            }, 2000);
        }
    },
    "click button.addBtn": function(event, instance) {
        var buttonIdx = event.currentTarget.getAttribute('data-btnIdx');
        var idx = event.currentTarget.getAttribute('data-idx');
        var devType = instance.$('#icon-' + idx).attr('data-value');
        buttonIdx = parseInt(buttonIdx);
        idx = parseInt(idx);
        devType = parseInt(devType);
        console.log("Add device: buttonIdx=" + buttonIdx + " idx=" + idx + " devType=" + devType);
        switch(devType) {
        case Constants.DEVTYPE_CURTAIN: // curtain
            console.log("add curtain");
            addCurtain(buttonIdx, idx, instance);
            break;
        case Constants.DEVTYPE_SCENE: // scene button
            var sceneId = parseInt(Session.get('scene-id'));
            var sceneName = instance.$("input.mbsc-control.sceneName").val();
            console.log("add scene button");
            addSceneButton(buttonIdx, idx, sceneId, sceneName, instance);
            break;
        default:
            console.log("Add button: " + buttonIdx + " " + idx);
            addButton(buttonIdx, idx, devType, instance);
            break;
        }
    },
    "show.bs.modal .modal": function(event, instance) {
        console.log("on Show modal");
        Session.set("netaddr", null);
        Session.set("endpoint", null);

        Router.current().render("HeaderTitle", {to: "modalHeader"});

        Router.current().render("BodyStage1", {to: "modalBody"});
    },
    "hide.bs.modal .modal": function(event, instance) {
        Router.current().render("Blank", {to: "modalHeader"});
        Router.current().render("Blank", {to: "modalBody"});
    }
});

Template.ModalAddDevice.onRendered(function() {
});
Template.ModalAddDevice.helpers({
    modules: Template.ModalAddDevice.modules,
    showConfig: function() {
        return ( Session.get("netaddr") == null) ? "":"hide";
    },
    showAdd: function() {
        console.log("showAdd");
        return ( Session.get("netaddr") != null) ? "":"hide";
    }
});

Template.BodyStage1.onRendered(function() {
    var self = this;
    Session.set('gang-type', undefined);
    Meteor.setTimeout(function() {
        try {
            var listDown = self.$('.list-down');
            listDown.mobiscroll().select({
                theme: 'mobiscroll', 
                lang: 'en', 
                display: 'bottom', 
                minWidth: 200,
                inputClass: 'form-control gangtype',
                // https://github.com/acidb/mobiscroll/issues/341
                onShow: function () {
                    $(window).off('focusin');
                },
                onSelect: function(valueText, inst) {
                    Session.set('gang-type', inst.getVal());
                }
            });
        }
        catch(err) {
            console.log(err);
        }
    }, 300);
});

// FragmentAdd Template
Template.FragmentAdd.helpers({
    devTypes: IconList.slice(0, Constants.DEVTYPE_CURTAIN),
    found: function() {
        return this.found;
    },
    foundId : function() {
        return "";
        console.log(this.found.id);
        return this.found.id;
    },
    foundName: function() {
        if(!this.found) return "";
        return this.found.name;
    },
    readonlyName: function() {
        (this.found == undefined)?"":"readonly";
    },
    roomName: function() {
        var rId = Session.get("room-id");
        if(this.found) rId = this.found.groupId;
        var room = Group.findOne({
                id:parseInt(rId)
            }, {fields:{name:1}
        });
        return room.name;
    },
    disabledButton: function() {
        return (this.found == undefined)?"":"disabled";
    },
    icon: function() {
        if( !this.found ) return "";
        return IconList[this.found.type];
    }
});

Template.FragmentAdd.events({
});

Template.FragmentAdd.onRendered(function() {
    var self = this;
    if(self.data || !self.data.found){
        Meteor.setTimeout(function() {
            try {
                var listDown = self.$('.list-down');
                listDown.mobiscroll().select({
                    theme: 'mobiscroll', 
                    lang: 'en', 
                    display: 'bottom', 
                    minWidth: 200,
                    inputClass: 'form-control w-percent-80',
                    // https://github.com/acidb/mobiscroll/issues/341
                    onShow: function () {
                        $(window).off('focusin');
                    },
                    onSelect: function(valueText, inst) {
                        self.$('label i').removeClass(function (index, css) {
                            return (css.match (/(^|\s)dicon-\S+/g) || []).join(' ');
                        }).addClass("dicon-" + IconList[inst.getVal()].icon).attr("data-value", inst.getVal());
                    }
                });
            }
            catch(err) {
                console.log(err);
            }
        }, 300);
    }
});
// FragmentAdd end

Template.Body4Gang.onRendered(function(){
    var foundGangs = this.data.foundGangs;
    for(var i = 0; i< Template.ModalAddDevice.quadGang.length; i++) {
        Router.current().render(Template.ModalAddDevice.quadGang[i].template, {
            to:Template.ModalAddDevice.quadGang[i].region,
            data:{btnIdx: i, index:i, found: foundGangs[i]}
        });
    }
});
Template.Body4Gang.helpers({
    modules: Template.ModalAddDevice.quadGang
});
Template.Body4Gang.events({});

Template.Body2Gang.onRendered(function(){
    var foundGangs = this.data.foundGangs;
    for(var i = 0; i< Template.ModalAddDevice.dualGang.length; i++) {
        Router.current().render(Template.ModalAddDevice.dualGang[i].template, {
            to:Template.ModalAddDevice.dualGang[i].region, 
            data:{btnIdx:i, index:i, found: foundGangs[i]}
        });
    }
});
Template.Body2Gang.helpers({
    modules: Template.ModalAddDevice.dualGang
});
Template.Body2Gang.events({});

Template.Header4Gang.onRendered(function() {
    Template.ModalAddDevice.modules = Template.ModalAddDevice.quadGang;
    this.$('.nav-pills a[href="#gang0"][data-toggle="pill"]').tab('show');
});

Template.Header4Gang.events(Template.ModalAddDevice.modalBodyEvents);

Template.Header4Gang.helpers({
    modules: Template.ModalAddDevice.quadGang
});
Template.Header2Gang.onRendered(function() {
    console.dir(Template.ModalAddDevice.modules);
    this.$('.nav-pills a[href="#gang0"][data-toggle="pill"]').tab('show');
});
Template.Header2Gang.helpers({
    modules: Template.ModalAddDevice.dualGang
});
Template.Header2Gang.events(Template.ModalAddDevice.modalBodyEvents);

Template.BodyCurtain.onRendered(function() {
    var foundGangs = this.data.foundGangs;
    Router.current().render("FragmentAddCurtain", {
        to:Template.ModalAddDevice.Curtain[0].region,
        data:{btnIdx:0, index:0, found: foundGangs[0]}
    });
});

Template.BodyCurtain.helpers({
    hasSwitchFree: function() {
        return ((this.foundGangs[0] == undefined) && (this.foundGangs[1] == undefined));
    }
});
Template.FragmentAddCurtain.helpers({
    roomName: function() {
        var rId = Session.get("room-id");
        if(this.found) rId = this.found.groupId;
        var room = Group.findOne({
                id:parseInt(rId)
            }, {fields:{name:1}
        });
        return room.name;
    }
});
Template.BodyCurtainSwitch.onRendered(function() {
    var foundGangs = this.data.foundGangs;
    Router.current().render("FragmentAddCurtain", {
        to:Template.ModalAddDevice.CurtainSwitch[0].region,
        data:{btnIdx:0, index:0, found: foundGangs[0]}
    });
    Router.current().render("FragmentAdd", {
        to: Template.ModalAddDevice.CurtainSwitch[1].region,
        data: {btnIdx: 2, index:1, found: foundGangs[2]}
    });
    Router.current().render("FragmentAdd", {
        to: Template.ModalAddDevice.CurtainSwitch[2].region,
        data: {btnIdx: 3, index: 2, found: foundGangs[3]}
    });
});
Template.BodyCurtainSwitch.helpers({
    hasSwitchFree: function() {
        return ((this.foundGangs[0] == undefined) && (this.foundGangs[1] == undefined));
    }
});

Template.FragmentAddScene.onRendered(function(){
    var self = this;
    Session.set('scene-id', -1);
    console.log("Run 111");
    Meteor.setTimeout(function() {
        try {
            var listDown = self.$('.list-down');
            listDown.mobiscroll().select({
                theme: 'mobiscroll', 
                lang: 'en', 
                display: 'bottom', 
                minWidth: 200,
                inputClass: 'form-control gangtype w-percent-80 sceneName',
                // https://github.com/acidb/mobiscroll/issues/341
                onShow: function () {
                    $(window).off('focusin');
                },
                onSelect: function(valueText, inst) {
                    Session.set('scene-id', inst.getVal());
                }
            });
        }
        catch(err) {
            console.log(err);
        }
    }, 300);
});
Template.FragmentAddScene.onDestroyed(function() {
    Session.set("scene-id", undefined);
});
Template.FragmentAddScene.helpers({
    scenes: function() {
        return Scene.find({}).fetch();
    },
    readonlyName: function() {
        (this.found == undefined)?"":"readonly";
    },
    roomName: function() {
        var rId = Session.get("room-id");
        if(this.found) rId = this.found.groupId;
        var room = Group.findOne({
                id:parseInt(rId)
            }, {fields:{name:1}
        });
        return room.name;
    },
    disabledButton: function() {
        return (this.found == undefined)?"":"disabled";
    }
});