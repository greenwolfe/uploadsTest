
/*
make the header a handle for moving the block.

text block, image block, files block, embed block,
to-do list block (drag copy from teacher to student?),
PGA block - conversation with teacher (or just use text
block?)

group block:  stays with originally assigned group by default.
option in dropdown to change to current group IF only difference is someone was added to the group
option to copy instead of move, so that something could be shared with more than one group
only owner (original poster, individual student) can delete, edit or move.  Others can copy.
*/
Meteor.startup(function() {
  Uploader.finished = function(index, file, tmpl) {
    _.extend(file,tmpl.data.formData);
    Meteor.call('insertFile',file);
  }
});

Template.activityPage.helpers({
  files: function() {
    return Files.find();
  },
  userInfo: function() {
    return {
      activityID: 1,
      userID: 2,
      group: [],
      section: null
    }
  },
  walls: function() {
    return Walls.find({activityID:'abc'});
  }
});

Template.activityBlock.helpers({
  src: function() {
    if (this.type.indexOf('image') >= 0) {
      return 'upload/' + this.path;
    } else return 'file_icon.png';
  }
});

Template.activityBlock.events({
  'click .deleteFile':function() {
    if (confirm('Are you sure you want to delete this file?')) {
      Meteor.call('deleteFile', this._id);
    }
  }
});