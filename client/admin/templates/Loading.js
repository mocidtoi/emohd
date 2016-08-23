var timevalue = new ReactiveVar(0);
Template.Loading.onRendered(function() {
    console.log("onRendered");
    timevalue.set(0);

    var ticker = function() {
        var val = timevalue.get();
        console.log(val);
        val = val + 100/TICKS;
        timevalue.set(val);
        if (val < 100) {
            Meteor.setTimeout(ticker, TICK_PERIOD);
        }
    }
    Meteor.setTimeout(ticker, TICK_PERIOD);
});

Template.Loading.onDestroyed(function() {
    timevalue.set(100);
    console.log("onDestroyed");
});

Template.Loading.helpers({
    progress() {
        return timevalue.get();
    }
});
Template.Loading.events({
    'click div.container': function() {
        Router.go("/");
    }
});

