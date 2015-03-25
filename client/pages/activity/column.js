Template.column.helpers({
  files: function() {
    return Files.find();
  },
  blocks: function() {
    return Blocks.find({columnID:this._id},{$sort: {rank:1}});
  }
});