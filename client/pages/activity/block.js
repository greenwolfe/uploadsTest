//make the corner button just a delete button now
//add footer with owner/creater and date
Template.block.helpers({
  blockType: function() {
    return Template[this.type + 'Block'];
  },
  notInEditedWall: function() {
    return (Session.get('editedWall') != Template.parentData().wallID);
  }
});

Template.block.events({
  'click .deleteBlock':function() {
    if (confirm('Are you sure you want to delete this block?')) {
      Meteor.call('deleteBlock', this._id);
    }
  }
});

Template.textBlock.helpers({
  notInEditedWall: function() {
    return (Session.get('editedWall') != Template.parentData().wallID);
  }
});

Template.imageBlock.helpers({
  imageFile: function() {
    return Files.findOne(this.image);
  }
});
