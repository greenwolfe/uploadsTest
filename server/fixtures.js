Meteor.startup(function () {
  if (Walls.find().count() == 0) {
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'teacher',
      owner: 'teacher'
    });
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'student',
      owner: 'st1'
    });
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'group',
      owner: ['st1','st2','st3'],
    });
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'section',
      owner: 'Bblock'
    });
  }

});