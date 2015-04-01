Files = new Meteor.Collection('files');
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
    return Files.insert(file);
  },
  'deleteFile': function(_id) {
    if (!_.isString(_id))
      throw new Meteor.Error(000,'cannot delete file, no valid id.');

    var file = Files.findOne(_id);
    if (file == null) {
      throw new Meteor.Error(404, 'File not found'); 
    }

    if (Meteor.isServer) 
      UploadServer.delete(file.path);
    Files.remove(_id);
  }
})
