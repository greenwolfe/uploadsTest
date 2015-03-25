Meteor.publish('files',function() {  //change to user or section ID in order to generate summary page for whole activity and section ... later!
  return Files.find();
});



