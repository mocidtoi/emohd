console.log(__meteor_runtime_config__);
var rootUrl = window.localStorage.getItem("__root_url");
//var rootUrl = 'http://192.168.2.189:5000/';
if(rootUrl){
    __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = __meteor_runtime_config__.ROOT_URL =  rootUrl;
    if(Meteor && Meteor.absoluteUrl &&  typeof Meteor.absoluteUrl.defaultOptions == "object"){
        Meteor.absoluteUrl.defaultOptions.rootUrl = rootUrl;
    }  
}
