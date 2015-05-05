//CheckedOutFiles = new Meteor.Collection('CheckedOutFiles');
/*
CheckedOutFiles.insert({ 
  _id: "Su9iW3Rw4bzarrX5j", 
  fileID: ...
  blockID: ...
  teacherID: ...
});
*/

/*Meteor.methods({
  'checkoutFile': function(coF) { //checkedoutFile
    //check if current user is teacher
    //verify that teacherID matches current user

    if (!('fileID' in coF)) 
      throw new Meteor.Error(401, "Cannot check out file, invalid file ID.");
    var file = Files.findOne(coF.fileID)
    if (!file)
      throw new Meteor.Error(402, "Cannot check out file.  File not found.");

    if (!('blockID' in coF)) 
      throw new Meteor.Error(401, "Cannot check out file, invalid block ID.");
    var block = Blocks.findOne(coF.blockID)
    if (!block)
      throw new Meteor.Error(402, "Cannot check out file, not a valid block");


  }*//*,
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
  }*/
//})
