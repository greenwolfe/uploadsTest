Meteor.startup(function () {
  if (Walls.find().count() == 0) {
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'teacher',
      owner: 'teacher', //probably no need for wall's owner?
      visible: true,
      order: 0
    });
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'student',
      owner: 'st1',
      visible: true,
      order: 1
    });
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'group',
      owner: ['st1','st2','st3'],
      visible: true,
      order: 2
    });
    Meteor.call('insertWall',{
      activityID: 'abc',
      type: 'section',
      owner: 'Bblock',
      visible: true,
      order: 3
    });
  }

});