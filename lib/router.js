/*Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function () { 
    var currentUser = Meteor.user();
    var userToShow = ['_ALL_'];
    if (currentUser) {
      userToShow.push(currentUser._id);
      if (currentUser.hasOwnProperty(profile) && currentUser.profile.hasOwnProperty(sectionID))
        userToShow.push(currentUser.profile.sectionID);
    }
    return [
      Meteor.subscribe('activities',Meteor.userId()), 
      Meteor.subscribe('units',false)
    ];
  }
});*/

Router.route('/', {
  name: 'activityPage',
  layoutTemplate: 'layout',
  yieldRegions: {
    'activityHeader': {to: 'header'}
  },
  subscriptions: function() {
    //returning a subscription handle or an array of subscription handles
    //adds them to the wait list
    //can use onAfterAction to load additional subscriptions behind the scenes?
    return [
      Meteor.subscribe('files'), 
      Meteor.subscribe('walls'),
      Meteor.subscribe('columns'),
      Meteor.subscribe('blocks')
    ]
  },
  action: function() {
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    };
  }
})

/*Router.map(function() {
  this.route('studentView', {
    path: '/',
    yieldTemplates: {
      'studentHeader': {to: 'header'}
    },
    waitOn: function() {
      return Meteor.subscribe('site');
    },
    onRun : function () {
       if (this.ready()) this.render();
    }
  });
});*/

//Router.onBeforeAction('loading');
