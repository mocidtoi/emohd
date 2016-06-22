import { Meteor } from 'meteor/meteor';

Constants = {
    DEVTYPE_CURTAIN:4,
    DEVTYPE_SCENE:5,
    SHUFFLE: 1,
    PREVIOUS: 2,
    PLAYPAUSE: 3,
    NEXT: 4
};

Router.configure({
    layoutTemplate: 'ApplicationLayout',
    waitOn: function() {
        var res = Meteor.subscribe('data');
        return [ res ];
    },
    loadingTemplate: 'LoadingScreen1'
});
var homeRouteOpt = {
    action: function() {
        this.render('Favorites');
        this.render('NetAtmo', {to: "widget"});
        setActiveTab(1);
    }
};
Router.route('/Rooms', {
    action: function() {
        this.render('Rooms');
        this.render('NetAtmo', {to: "widget"});
        setupModalAddRoom(this);
        this.render('ModalAddDevice', {to: "modal-adddev"});
        this.render('ModalCurtainControl', {to: "modal-curtain"});
        setActiveTab(2);
    },
});
Router.route('/', homeRouteOpt);
Router.route('/Favorites', homeRouteOpt);
Router.route('/Scenes', {
    action: function() {
        setActiveTab(3);
        this.render('Scenes');
        this.render('NetAtmo', {to: 'widget'});
        setupModalAddScene(this);
    }
});
Router.route('/Notifications', {
    action: function() {
        Session.set("title", "Notifications");
        setActiveTab(4);
        this.render('NetAtmo', {to: "widget"});
        this.render('Notifications');
    }
});
Router.route('/More', {
    action: function() {
        setActiveTab(5);
        Session.set("title", "More ...");
        this.render('More');
        this.render('NetAtmo', {to: "widget"});
        this.render('ModalConfig', {to: "modal-config"});
    }
});

Router.route('/Device/:gid/:id', {
    action: function() {
        Session.set("title", null);
        this.render('Device');
        this.render('NetAtmo', {to: "widget"});
        this.render('CancelBtn', {to: "leftNav"});

        setBackLink("/Rooms");
        this.render('SaveBtn', {to: "rightNav"});
        setActiveTab(-1);
    }
});

Router.route('/Scene/:scid', {
    action: function() {
        Session.set("title", null);
        this.render("Scene");
        this.render('NetAtmo', {to: 'widget'});
        this.render('CancelBtn', {to: 'leftNav'});
        setBackLink('/Scenes');
        this.render('SaveBtn', {to: "rightNav"});
        setActiveTab(-1);
    }
});
Router.route('/Musics', {
    waitOn: function() {
        var res = Meteor.subscribe('music');
        return [
            res
        ];
    },
    action: function() {
        Session.set('title', "Musics");
        this.render("Musics");
        this.render('NetAtmo', {to: 'widget'});
        this.render("Player", {to: 'player'});
        this.render('SettingsBtn', {to: "rightNav"});
        this.render('ModalConfig', {to: "modal-config"});
        setActiveTab(-1);
    }
});
if (Meteor.isClient) {
    Notifier = new EventDDP("emohd");

    Device = new Mongo.Collection('device');
    Group = new Mongo.Collection('group');
    SceneDev = new Mongo.Collection('scenedev');
    Task = new Mongo.Collection('task');
    Favorite = new Mongo.Collection('favorite');
    Scene = new Mongo.Collection('scene');

    Song = new Mongo.Collection('song');
    PlayingItem = new Mongo.Collection('playingItem');
    Progress = new Mongo.Collection('progress');

    Meteor.Notification = new Queue(20);
    IconList = [
        {icon:"light", title:"Light", color:"bg-cyan-800"}, 
        {icon:"fan", title:"Fan", color:"bg-blue-800"}, 
        {icon:"aircon", title: "Air conditioner", color: "bg-green-800"},
        {icon:"tv", title: "Television", color: "bg-pink-800"}, 
        {icon:"curtain", title: "Curtain", color: "bg-indigo-800"},
        {icon:"scene", title: "Command", color: "bg-teal-800"}
    ];
    myConfirm = function(title, content, callback) {
        Session.set('confirm-title',title);
        Session.set('confirm-content', content);
        Template.ModalConfirm.cbFunc = callback;
        console.log(Template.ModalConfirm.title);
        $('#confirm').modal();
    };
    isDevOn = function(id) {
        return Device.findOne(id).status == 49;
    };
    setActiveTab = function(index) {
        Session.set('active-tab', index);
    };
    setBackLink = function(backlink) {
        Session.set('cancel-btn-back', backlink);
    };
    getBackLink = function() {
        var backlink = Session.get('cancel-btn-back');
        return backlink?backlink:"#";
    };
    CALLBACKS = {
        saveBtn: null
    };
    MODALS = [
        {id: "modal-addroom"},
        {id: "modal-addscene"}
    ];
    setupModalAddRoom = function(router) {
        router.render('ModalAddRoom', {to: "modal-addroom"});
        Session.set('modal-top', MODALS[0].id);
        router.render('AddBtn', {to: "rightNav"});
    }
    setupModalAddScene = function(router) {
        router.render('ModalAddScene', {to: "modal-addroom"});
        Session.set('modal-top', MODALS[1].id);
        router.render('AddBtn', {to: "rightNav"});
    }
    Meteor.Spinner.options = {
        lines: 13, // The number of lines to draw
        length: 10, // The length of each line
        width: 5, // The line thickness
        radius: 15, // The radius of the inner circle
        corners: 0.7, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#fff', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: true, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '45%', // Top position relative to parent in px
        left: '50%' // Left position relative to parent in px        
    }
}
