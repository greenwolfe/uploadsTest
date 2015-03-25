Template.block.helpers({
  src: function() {
    var file = Files.find(this.image);
    if (file.type.indexOf('image') >= 0) {
      return 'upload/' + file.path;
    } else return 'file_icon.png';
  },
  size: function() {
    var file = Files.find(this.image);
    return file.size; 
  }
});

Template.block.events({
  'click .deleteBlock':function() {
    if (confirm('Are you sure you want to delete this block?')) {
      Meteor.call('deleteBlock', this._id);
    }
  }
});