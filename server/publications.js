Meteor.publish('files',function() {  //change to user or section ID in order to generate summary page for whole activity and section ... later!
  return Files.find();
});

Meteor.publish('walls',function() {  //change to user or section ID in order to generate summary page for whole activity and section ... later!
  return Walls.find();
});

Meteor.publish('columns',function() {  //change to user or section ID in order to generate summary page for whole activity and section ... later!
  return Columns.find();
});

Meteor.publish('blocks',function() {  //change to user or section ID in order to generate summary page for whole activity and section ... later!
  return Blocks.find();
});




