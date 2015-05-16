Meteor.startup(function () {
  if (Walls.find().count() == 0) {
    Meteor.call('insertWall',{
      activityID: theActivityID,
      type: 'teacher',
      //owner: 'teacher', //probably no need for wall's owner?
      visible: true,
      order: 0
    });
    Meteor.call('insertWall',{
      activityID: theActivityID,
      type: 'student',
      //owner: 'st1',
      visible: true,
      order: 1
    });
    Meteor.call('insertWall',{
      activityID: theActivityID,
      type: 'group',
      //owner: ['st1','st2','st3'],
      visible: true,
      order: 2
    });
    Meteor.call('insertWall',{
      activityID: theActivityID,
      type: 'section',
      //owner: 'Bblock',
      visible: true,
      order: 3
    });
  } else {
    Walls.find().forEach(function(wall) {
      Walls.update(wall._id,{$set: {activityID:theActivityID}});
    });
    Columns.find().forEach(function(a) {
      Columns.update(a._id,{$set: {activityID:theActivityID}});
    });
    Blocks.find().forEach(function(a) {
      Blocks.update(a._id,{$set: {activityID:theActivityID}});
    });
    Files.find().forEach(function(a) {
      Files.update(a._id,{$set: {activityID:theActivityID}});
    });
  }
});