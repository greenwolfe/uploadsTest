Files = new Meteor.Collection('Files');
/*
Files.insert({ 
  _id: "Su9iW3Rw4bzarrX5j", 
  name: "MotionDetector.jpeg", 
  size: 4720, 
  type: "image/jpeg", 
  error: null, 
  path: "/MotionDetector.jpeg", 
  url: "http://localhost:3000/upload/MotionDetector.jpeg", 
  activityID: 1, 
  userID: 2, 
  group: Array[0]
  section: null
});
Must also have: 
  share: teacher, student, group, section
  position: {x:0, y:3} /* x: column number 0,1,2, ...
                       /* y: position in column (by rank, adjusted by drag and drop alogrithm)
*/
/*
activityPageLayout
  _id: ...
  activityID: ...
  share:
  shareID:  sectionID, studentID, 'teacher', [groupIDs] /* group must match exactly?
     /*user gets stuff lost if changes group or section ... ???  have to think this through
  no columns:  1,2,3 ... would have to change on every file if changed?
  size: [4,4,4]  (all that's needed?)
*/

/*
  each share gets a header with columns laid out, 
  can shrink a column, 
  add into empty space, or expand into empty space
*/

Meteor.methods({
  'insertFile': function(file) {
    if (!('blockID' in file)) 
      throw new Meteor.Error(401, "Cannot add file, you did not specify a block to put it in.");
    var block = Blocks.findOne(file.blockID)
    if (!block)
      throw new Meteor.Error(402, "Cannot add file, not a valid block");
    if (!('visible' in file))
      file.visible = true;

    //add at end of existing file list
    var last = Files.findOne({blockID:file.blockID},{sort:{order:-1}});
    file.order = (last && ('order' in last)) ? last.order + 1 : 0;
    return Files.insert(file);
  },
  'deleteFile': function(_id) {
    if (!_.isString(_id))
      throw new Meteor.Error(000,'cannot delete file, id not valid.');
    var file = Files.findOne(_id);
    if (!file) 
      throw new Meteor.Error(404, 'File not found'); 
    var fileCount = Files.find({path:file.path}).count();

    //test this code
    var ids = _.pluck(Files.find({blockID:file.blockID,order:{$gt: file.order}},{fields: {_id: 1}}).fetch(), '_id');
    if (Meteor.isServer && (fileCount <= 1)) //only delete file itself if there are no other links to it
      UploadServer.delete(file.path);
    Files.remove(_id); //remove this link regardless
    //after deleting, move any files below this one up
    Files.update({_id: {$in: ids}}, {$inc: {order:-1}}, {multi: true});
  }
})
